package database

import (
	"fmt"

	"github.com/koha90/podkrepizza/internal/models"
)

// Categories ...
func (s *service) Categories() ([]*models.Category, error) {
	const op = "database.Category"

	var categories []*models.Category

	query := `
		SELECT id, name
		FROM category
	`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("%s: query error: %w", op, err)
	}
	defer rows.Close()

	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			return nil, fmt.Errorf("%s: scan error: %w", op, err)
		}

		categories = append(categories, &c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("%s: rows error: %w", op, err)
	}

	return categories, nil
}

// CategoryByID ...
func (s *service) CategoryByID(id int) (*models.Category, error) {
	const op = "database.CategoryByID"

	query := `
		SELECT name
		FROM category 
		WHERE id=$1;
	`

	var c models.Category

	err := s.db.QueryRow(query, id).Scan(&c.Name)
	if err != nil {
		return nil, fmt.Errorf("%s: query error: %w", op, err)
	}

	return &c, nil
}
