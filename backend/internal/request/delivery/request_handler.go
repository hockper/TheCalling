// Package delivery provides the HTTP delivery layer for the request module.
package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/domain"
	"backend/internal/middleware"
	"backend/internal/request/usecase"
)

// RequestHandler handles HTTP requests for the service request endpoints.
type RequestHandler struct {
	usecase domain.RequestUsecase
}

// NewRequestHandler creates a new RequestHandler.
func NewRequestHandler(uc domain.RequestUsecase) *RequestHandler {
	return &RequestHandler{usecase: uc}
}

// HandleRequests handles POST /api/requests (create) and GET /api/requests (list).
func (h *RequestHandler) HandleRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.createRequest(w, r)
	case http.MethodGet:
		h.listRequests(w, r)
	default:
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

// HandleRequestByID handles GET /api/requests/{id} and PATCH /api/requests/{id}.
func (h *RequestHandler) HandleRequestByID(w http.ResponseWriter, r *http.Request) {
	// Extract the ID from the URL path: /api/requests/{id}
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/requests/"), "/")
	id := parts[0]
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "request ID is required"})
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getRequest(w, r, id)
	case http.MethodPatch:
		h.updateRequest(w, r, id)
	default:
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

// createRequest handles POST /api/requests.
func (h *RequestHandler) createRequest(w http.ResponseWriter, r *http.Request) {
	userRole := middleware.GetUserRole(r.Context())
	if userRole != string(domain.RoleRequester) {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "only requesters can create requests"})
		return
	}

	var input domain.CreateRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	input.CreatorID = middleware.GetUserID(r.Context())

	req, err := h.usecase.Create(r.Context(), input)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, req)
}

// listRequests handles GET /api/requests.
func (h *RequestHandler) listRequests(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	userRole := middleware.GetUserRole(r.Context())

	limit := parseIntQuery(r, "limit", 20)
	offset := parseIntQuery(r, "offset", 0)

	filter := domain.ListRequestsFilter{
		Limit:  limit,
		Offset: offset,
	}

	// Requesters can only see their own requests
	if userRole == string(domain.RoleRequester) {
		filter.CreatorIDs = []string{userID}
	} else {
		if queryCreatorIDs, ok := r.URL.Query()["creator_id"]; ok && len(queryCreatorIDs) > 0 {
			filter.CreatorIDs = queryCreatorIDs
		}
	}

	scope := r.URL.Query().Get("scope")
	if scope == "" {
		scope = "me"
	}
	filter.Scope = scope

	// If handler and scope is "me", default filter.AssigneeID to the logged-in handler's ID
	if userRole == string(domain.RoleHandler) && scope == "me" {
		filter.AssigneeID = &userID
	}

	// If assignee_id query param is explicitly provided, override
	if queryAssigneeID := r.URL.Query().Get("assignee_id"); queryAssigneeID != "" {
		filter.AssigneeID = &queryAssigneeID
	}

	filter.Search = r.URL.Query().Get("search")

	if queryPriorities, ok := r.URL.Query()["priority"]; ok && len(queryPriorities) > 0 {
		lowerPriorities := make([]string, len(queryPriorities))
		for i, p := range queryPriorities {
			lowerPriorities[i] = strings.ToLower(p)
		}
		filter.Priorities = lowerPriorities
	}

	result, err := h.usecase.List(r.Context(), filter, userRole)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list requests"})
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// getRequest handles GET /api/requests/{id}.
func (h *RequestHandler) getRequest(w http.ResponseWriter, r *http.Request, id string) {
	userID := middleware.GetUserID(r.Context())
	userRole := middleware.GetUserRole(r.Context())

	req, err := h.usecase.GetByID(r.Context(), id, userID, userRole)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, req)
}

// updateRequest handles PATCH /api/requests/{id}.
func (h *RequestHandler) updateRequest(w http.ResponseWriter, r *http.Request, id string) {
	userRole := middleware.GetUserRole(r.Context())
	userID := middleware.GetUserID(r.Context())

	var input domain.UpdateRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req, err := h.usecase.Update(r.Context(), id, input, userID, userRole)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, req)
}

// handleUsecaseError maps usecase errors to HTTP status codes.
func handleUsecaseError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, usecase.ErrTitleRequired),
		errors.Is(err, usecase.ErrDescriptionRequired),
		errors.Is(err, usecase.ErrInvalidPriority),
		errors.Is(err, usecase.ErrAssigneeRequired),
		errors.Is(err, usecase.ErrInvalidStatus),
		errors.Is(err, usecase.ErrAssigneeNotFound):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
	case errors.Is(err, usecase.ErrRequestNotFound):
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
	case errors.Is(err, usecase.ErrForbidden):
		writeJSON(w, http.StatusForbidden, map[string]string{"error": err.Error()})
	default:
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}

// parseIntQuery parses an integer query parameter with a default value.
func parseIntQuery(r *http.Request, key string, defaultVal int) int {
	val := r.URL.Query().Get(key)
	if val == "" {
		return defaultVal
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return parsed
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	b, _ := json.Marshal(data)
	_, _ = w.Write(b)
}
