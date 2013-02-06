package main;

import (
   "github.com/garyburd/go-mongo/mongo"
   "net/http"
   "github.com/gorilla/pat"
   "log"
   "fmt"
   "encoding/json"
   "time"
   "regexp"
)

const PORT = ":5645"


/** LOGGER */
func Log(handler http.Handler) http.Handler {
   return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL)
      handler.ServeHTTP(w, r)
   })
}


/** ERROR HANDLER */
type ErrorMessage struct {
   Error string
}

func ErrorResponse(w http.ResponseWriter, message string) {
   error := new(ErrorMessage)
   error.Error = message

   json, _ := json.Marshal(error)

   fmt.Fprintf(w, "%s", json)
}


/** POST HANDLER */
type SuccessMassge struct {
   Success bool
}

const UUID_FORMAT = "^[a-z0-9]{8}-[a-z0-9]{4}-[1-5][a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{12}$"

const COLOR_FORMAT = "^([0-9a-fA-F]{2}){3}$"

func PostHandler(w http.ResponseWriter, req *http.Request) {
   uuid := req.URL.Query().Get(":uuid")
   color := req.URL.Query().Get(":color")

   // Error checking on input
   uuidRe := regexp.MustCompile(UUID_FORMAT)
   if !uuidRe.MatchString(uuid) {
      ErrorResponse(w, "Invalid user id")
      return
   }

   colorRe := regexp.MustCompile(COLOR_FORMAT)
   if !colorRe.MatchString(color) {
      ErrorResponse(w, "Invalid color")
      return
   }

   conn, err := mongo.Dial("localhost")
   if err != nil {
      ErrorResponse(w, "Error connecting to database")
      return
   }
   defer conn.Close()

   // Create a database object.
   db := mongo.Database{conn, "sitesquares", mongo.DefaultLastErrorCmd}

   // Create a collection object object for the "colors" collection.
   colors := db.C("colors")

   t := time.Now().Unix()

   insertErr := colors.Insert(mongo.M{"user": uuid, "color": color, "timestamp": t})

   if insertErr != nil {
      ErrorResponse(w, "Error writing to database")
      return
   }

   success := new(SuccessMassge)
   success.Success = true

   json, _ := json.Marshal(success)

   fmt.Fprintf(w, "%s", json)
}


/** MAIN */
func main() {
   r := pat.New()
   r.Post("/api/post/{uuid}/{color}", PostHandler)
   http.Handle("/", r)
   log.Printf("Server running on %s\n", PORT)
   http.ListenAndServe(PORT, Log(http.DefaultServeMux))
}