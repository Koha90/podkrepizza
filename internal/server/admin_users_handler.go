package server

import (
	"encoding/json"
	"net/http"

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

	if !user.IsAdmin {
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
