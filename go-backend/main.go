package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

// FileInfo represents file metadata
type FileInfo struct {
	ID          string    `json:"id"`
	Filename    string    `json:"filename"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Tags        []string  `json:"tags"`
	Author      string    `json:"author"`
	Version     string    `json:"version"`
	FileSize    int64     `json:"fileSize"`
	UploadDate  time.Time `json:"uploadDate"`
	FilePath    string    `json:"path"`
	HasHistory  bool      `json:"hasHistory"`
}

// Category represents file category
type Category struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Description string `json:"description"`
}

// File-based storage
var files []FileInfo
var categories []Category

// Default categories
func initCategories() {
	categories = []Category{
		{"dashboard", "仪表板", "pi-chart-line", "#3B82F6", "数据可视化和仪表板页面"},
		{"portfolio", "作品集", "pi-briefcase", "#10B981", "个人或公司作品展示页面"},
		{"documentation", "文档", "pi-book", "#F59E0B", "文档和说明页面"},
		{"template", "模板", "pi-palette", "#EF4444", "可重用的页面模板"},
		{"landing", "落地页", "pi-home", "#8B5CF6", "营销和推广落地页"},
		{"admin", "管理面板", "pi-cog", "#6B7280", "后台管理和控制面板"},
		{"ecommerce", "电子商务", "pi-shopping-cart", "#EC4899", "在线商店和购物页面"},
		{"blog", "博客", "pi-pencil", "#06B6D4", "博客和文章页面"},
		{"other", "其他", "pi-folder", "#84CC16", "其他类型的页面"},
	}
}

// Load files from JSON file
func loadFiles() {
	dbDir := "./db"
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		log.Printf("Warning: Could not create db directory: %v", err)
	}

	filePath := filepath.Join(dbDir, "files.json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		files = []FileInfo{}
		return
	}

	if err := json.Unmarshal(data, &files); err != nil {
		log.Printf("Error unmarshaling files: %v", err)
		files = []FileInfo{}
	}
}

// Save files to JSON file
func saveFiles() {
	dbDir := "./db"
	filePath := filepath.Join(dbDir, "files.json")

	data, err := json.MarshalIndent(files, "", "  ")
	if err != nil {
		log.Printf("Error marshaling files: %v", err)
		return
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		log.Printf("Error saving files: %v", err)
	}
}

// enableCORS adds CORS related headers to the response
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// corsMiddleware is a middleware that handles CORS
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: %s %s", r.Method, r.URL.Path)
		enableCORS(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// uploadHandler handles file uploads
func uploadHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the multipart form
	maxSize, _ := strconv.ParseInt(os.Getenv("MAX_UPLOAD_SIZE"), 10, 64)
	if maxSize <= 0 {
		maxSize = 10 << 20 // 10MB default
	}

	if err := r.ParseMultipartForm(maxSize); err != nil {
		http.Error(w, fmt.Sprintf("Error parsing multipart form: %v", err), http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("htmlFile")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error retrieving the file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create uploads directory
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		http.Error(w, fmt.Sprintf("Error creating upload directory: %v", err), http.StatusInternalServerError)
		return
	}

	// Save file
	dstPath := filepath.Join(uploadDir, handler.Filename)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating file: %v", err), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err = io.Copy(dst, file); err != nil {
		http.Error(w, fmt.Sprintf("Error saving file: %v", err), http.StatusInternalServerError)
		return
	}

	// Get form data
	title := r.FormValue("title")
	if title == "" {
		title = strings.TrimSuffix(handler.Filename, filepath.Ext(handler.Filename))
	}
	description := r.FormValue("description")
	category := r.FormValue("category")
	if category == "" {
		category = "other"
	}
	tagsStr := r.FormValue("tags")
	author := r.FormValue("author")
	version := r.FormValue("version")

	var tags []string
	if tagsStr != "" {
		for _, tag := range strings.Split(tagsStr, ",") {
			if trimmed := strings.TrimSpace(tag); trimmed != "" {
				tags = append(tags, trimmed)
			}
		}
	}

	// Create file info
	fileInfo := FileInfo{
		ID:          uuid.New().String(),
		Filename:    handler.Filename,
		Title:       title,
		Description: description,
		Category:    category,
		Tags:        tags,
		Author:      author,
		Version:     version,
		FileSize:    handler.Size,
		UploadDate:  time.Now(),
		FilePath:    "/uploads/" + handler.Filename,
		HasHistory:  false,
	}

	// Add to files list and save
	files = append([]FileInfo{fileInfo}, files...)
	saveFiles()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "File uploaded successfully",
		"file":    fileInfo,
	})
}

// filesHandler returns list of uploaded files
func filesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// deleteFileHandler deletes a file
func deleteFileHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != http.MethodDelete {
		http.Error(w, "Only DELETE method is allowed", http.StatusMethodNotAllowed)
		return
	}

	filename := strings.TrimPrefix(r.URL.Path, "/api/files/")
	if filename == "" {
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}

	// Delete from filesystem
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	filePath := filepath.Join(uploadDir, filename)
	if err := os.Remove(filePath); err != nil {
		log.Printf("Error deleting file %s: %v", filename, err)
	}

	// Remove from files list
	for i, file := range files {
		if file.Filename == filename {
			files = append(files[:i], files[i+1:]...)
			break
		}
	}
	saveFiles()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File deleted successfully",
	})
}

// categoriesHandler returns list of categories
func categoriesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

// healthHandler provides health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now(),
		"version":   "1.0.0",
		"storage":   "file",
	})
}

// spaHandler implements the http.Handler interface for SPA routing
type spaHandler struct {
	staticPath string
	indexPath  string
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	path = filepath.Join(h.staticPath, path)

	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("HTML Card Viewer starting (file storage mode)...")

	// Initialize file-based storage
	initCategories()
	loadFiles()

	// Create necessary directories
	dirs := []string{
		os.Getenv("UPLOAD_DIR"),
		"./db",
		"./dist",
		"./backups",
	}
	for _, dir := range dirs {
		if dir != "" {
			if err := os.MkdirAll(dir, 0755); err != nil {
				log.Printf("Warning: Could not create directory %s: %v", dir, err)
			}
		}
	}

	// API routes
	http.HandleFunc("/api/upload", uploadHandler)
	http.HandleFunc("/api/files", filesHandler)
	http.HandleFunc("/api/files/", deleteFileHandler)
	http.HandleFunc("/api/categories", categoriesHandler)
	http.HandleFunc("/api/health", healthHandler)

	// File server for uploads
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	fileServer := http.FileServer(http.Dir(uploadDir))
	http.Handle("/uploads/", http.StripPrefix("/uploads/", corsMiddleware(fileServer)))

	// SPA handler for frontend
	spa := spaHandler{staticPath: "./dist", indexPath: "index.html"}
	http.Handle("/", spa)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Frontend: http://localhost:%s", port)
	log.Printf("API: http://localhost:%s/api/", port)
	log.Printf("Storage: file-based (./db/files.json)")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}