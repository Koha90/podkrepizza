package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/koha90/podkrepizza/internal/models"
)

// usersHandler ...
func (s *Server) usersHandler(w http.ResponseWriter, r *http.Request) {
	const op = "server.usersHandler"

	// Проверяем токен
	c, err := r.Cookie("token")
	if err != nil {
		s.log.Error(op+": Token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	tkn, err := jwt.ParseWithClaims(c.Value, &models.Claims{}, func(token *jwt.Token) (any, error) {
		return jwtKey, nil
	})
	if err != nil || !tkn.Valid {
		s.log.Error(op+": Parse token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	claims := tkn.Claims.(*models.Claims)

	user, err := s.db.UserByEmail(claims.Email)
	if err != nil {
		s.log.Error(op+": user not found", "error", err)
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	if user.Role != "admin" {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	users, err := s.db.AllUsers()
	if err != nil {
		s.log.Error(op, "error", err)
		http.Error(w, "Ошибка получения списка пользователей", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

type updateUserRequest struct {
	Role      *string `json:"role,omitempty"`
	IsBlocked *bool   `json:"is_blocked,omitempty"`
}

// updateUserHandler - ...
func (s *Server) updateUserHandler(w http.ResponseWriter, r *http.Request) {
	const op = "server.updateUserHandler"

	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		s.log.Error(op, "error", err)
		http.Error(w, "Неверный id", http.StatusBadRequest)
		return
	}

	var req updateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Обновляем только то, что пришло
	if req.Role != nil {
		if err := s.db.SetRole(id, *req.Role); err != nil {
			s.log.Error(op, "set role error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if req.IsBlocked != nil {
		if err := s.db.SetUserBlocked(id, *req.IsBlocked); err != nil {
			s.log.Error(op, "change block error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "ok"}`))
}
