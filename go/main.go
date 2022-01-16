package main

import (
    "log"
//     "time"
    "encoding/json"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/websocket/v2"
    _ "github.com/go-sql-driver/mysql"
    "database/sql"
)

func dbConn() (db *sql.DB) {
    db, err := sql.Open("mysql", "root:secret@db/general")
    if err != nil {
        panic(err.Error())
    }
//     db.SetConnMaxLifetime(time.Minute * 3)
//     db.SetMaxOpenConns(10)
//     db.SetMaxIdleConns(10)

    return db
}

func main() {
    app := fiber.New()

    app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Hello, World! [GO]")
    })

    app.Get("/hello", websocket.New(func(c *websocket.Conn) {
        msg := []byte("Hello World")
        c.WriteMessage(1, msg)
    }))

    app.Get("/db", websocket.New(func(c *websocket.Conn) {
        log.Printf("start")
        db := dbConn()
        result, err := db.Query("SELECT * FROM CUSTOMER LIMIT 10")
        if err != nil {
            panic(err.Error())
        }
        bytes, err := json.Marshal(result)
        if err != nil {
            panic(err)
        }
        c.WriteMessage(1, bytes)
        defer db.Close()
    }))

    app.Get("/*", websocket.New(func(c *websocket.Conn) {
      for {
        mtype, msg, err := c.ReadMessage()
        if err != nil {
          break
        }
        log.Printf("Read: %s", msg)
        log.Printf("mtype: %s", mtype)

        err = c.WriteMessage(mtype, msg)
        if err != nil {
          break
        }
      }
    }))

    log.Fatal(app.Listen(":80"))
}