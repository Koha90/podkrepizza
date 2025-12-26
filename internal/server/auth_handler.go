package server

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/koha90/podkrepizza/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("super-secret-key")

// TODO: вынести весь sql в database.

// registerHandler - регистрация пользователя.
func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	_, err := s.db.DB().Exec(
		`INSERT INTO users (email, hash_password) VALUES ($1,$2)`,
		creds.Email,
		string(hashed),
	)
	if err != nil {
		s.log.Error("DB insert error", "error", err)
		http.Error(w, "user exists or db error", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "registered"})
}

// loginHandler - вход пользователя
func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.Credentials
	json.NewDecoder(r.Body).Decode(&creds)

	var storedPassword, role string
	var name sql.NullString
	err := s.db.DB().
		QueryRow(`SELECT hash_password, name, role FROM users WHERE email=$1`, creds.Email).
		Scan(&storedPassword, &name, &role)
	if err != nil {
		s.log.Error("DB select error", "error", err)
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(creds.Password)) != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	expiration := time.Now().Add(7 * 24 * time.Hour)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &models.Claims{
		Email: creds.Email,
		Name:  name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
		},
	})
	tokenString, _ := token.SignedString(jwtKey)

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expiration,
		HttpOnly: true,
		Secure:   false,                // INFO: Убрать после разработки на проде.
		SameSite: http.SameSiteLaxMode, // для обычного сайта. http.SameSiteLaxMode для telegram.
		Path:     "/",
	})

	json.NewEncoder(w).Encode(map[string]string{"message": "logged in"})
}

func (s *Server) logoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // INFO: Убрать после разработки на проде.

		SameSite: http.SameSiteLaxMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})
	json.NewEncoder(w).Encode(map[string]string{"message": "logged out"})
}
