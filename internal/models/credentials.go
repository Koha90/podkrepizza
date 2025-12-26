package models

import (
	"database/sql"

	"github.com/golang-jwt/jwt/v5"
)

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	Email string         `json:"email"`
	Name  sql.NullString `json:"name"`
	Role  string         `json:"role"`
	jwt.RegisteredClaims
}
