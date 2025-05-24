package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

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

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers
	enableCORS(w)

	log.Printf("Received upload request, method: %s, ContentType: %s", r.Method, r.Header.Get("Content-Type"))

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		log.Printf("Rejected non-POST request: %s", r.Method)
		return
	}

	// Parse the multipart form:
	// Set a limit for the uploaded file size (e.g., 10 MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, fmt.Sprintf("Error parsing multipart form: %v", err), http.StatusBadRequest)
		log.Printf("Failed to parse form: %v", err)
		return
	}

	file, handler, err := r.FormFile("htmlFile")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error retrieving the file from form-data: %v", err), http.StatusBadRequest)
		log.Printf("Failed to get file: %v", err)
		return
	}
	defer file.Close()

	log.Printf("File upload info:")
	log.Printf("- Filename: %s", handler.Filename)
	log.Printf("- File size: %d bytes", handler.Size)
	log.Printf("- MIME type: %s", handler.Header.Get("Content-Type"))

	// Create the uploads directory if it doesn't exist
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		log.Printf("Creating upload directory: %s", uploadDir)
		if mkDirErr := os.Mkdir(uploadDir, 0755); mkDirErr != nil {
			http.Error(w, fmt.Sprintf("Error creating uploads directory: %v", mkDirErr), http.StatusInternalServerError)
			log.Printf("Failed to create directory: %v", mkDirErr)
			return
		}
	}

	// Create a new file in the uploads directory
	dstPath := filepath.Join(uploadDir, handler.Filename)
	log.Printf("Saving file to: %s", dstPath)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating the file on server: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to create file: %v", err)
		return
	}
	defer dst.Close()

	// Copy the uploaded file to the destination file
	bytesCopied, err := io.Copy(dst, file)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error saving the file: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to save file: %v", err)
		return
	}

	log.Printf("File uploaded successfully, copied %d bytes", bytesCopied)

	// Return a success response
	w.Header().Set("Content-Type", "application/json")
	responseJSON := fmt.Sprintf(`{"message": "File uploaded successfully", "filename": "%s", "path": "/uploads/%s"}`,
		handler.Filename, handler.Filename)

	log.Printf("Returning response: %s", responseJSON)
	fmt.Fprint(w, responseJSON)
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("HTML Card Viewer backend service starting...")

	// Create uploads directory
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		log.Printf("Creating upload directory: %s", uploadDir)
		if err := os.Mkdir(uploadDir, 0755); err != nil {
			log.Fatalf("Error creating uploads directory: %v\n", err)
			return
		}
	}

	// Setup routes
	http.HandleFunc("/upload", uploadHandler)

	// Create a file server to serve static files
	fileServer := http.FileServer(http.Dir("./uploads"))

	// Wrap file server with CORS middleware
	corsFileServer := corsMiddleware(fileServer)
	http.Handle("/uploads/", http.StripPrefix("/uploads/", corsFileServer))

	log.Println("Server started, listening on port :8080")
	log.Println("Upload endpoint: http://localhost:8080/upload")
	log.Println("File service: http://localhost:8080/uploads/")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server startup failed: %s\n", err)
	}
}