package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/websocket/v2"
)

func main() {
    app := fiber.New()

    app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Hello, World!")
    })

    app.Get("/ws", websocket.New(func(c *websocket.Conn) {
      // Websocket logic
      for {
        mtype, msg, err := c.ReadMessage()
        if err != nil {
          break
        }
        log.Printf("Read: %s", msg)

        err = c.WriteMessage(mtype, msg)
        if err != nil {
          break
        }
      }
    }))

    log.Fatal(app.Listen(":80"))
}