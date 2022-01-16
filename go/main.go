package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/websocket/v2"
)

func main() {
    app := fiber.New()

    app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Hello, World! [GO]")
    })

    app.Get("/hello", websocket.New(func(c *websocket.Conn) {
        msg := []byte("Hello World")
        c.WriteMessage(1, msg);
    }))

    app.Get("/db", websocket.New(func(c *websocket.Conn) {

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