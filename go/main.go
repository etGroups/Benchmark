package main

import (
    "log"
    "time"
    "strconv"
    "encoding/json"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/websocket/v2"
    _ "github.com/go-sql-driver/mysql"
    "database/sql"
)

type Customer struct {
    Cust_code       string
    Cust_name       string
    Cust_city       string
    Working_area    string
    Cust_country    string
    Grade           int
    Opening_amt     float32
    Receive_amt     float32
    Payment_amt     float32
    Outstanding_amt float32
    Phone_no        string
    Agent_code      string
}

func dbConn() (db *sql.DB) {
    db, err := sql.Open("mysql", "root:secret@(db)/general")
    if err != nil {
        panic(err.Error())
    }
    db.SetConnMaxLifetime(time.Minute * 3)
    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(10)

    return db
}

func getCustomers(limit int) ([]byte) {
    if limit == 0 {
        limit = 10
    }

    db := dbConn()
    rows, err := db.Query("SELECT * FROM CUSTOMER LIMIT "+strconv.Itoa(limit))
    if err != nil {
        panic(err.Error())
    }

    customer := Customer{}
    results := []Customer{}
    for rows.Next() {
        var grade int
        var cust_code, cust_name, cust_city, working_area, cust_country, phone_no, agent_code string
        var opening_amt, receive_amt, payment_amt, outstanding_amt float32

        err = rows.Scan(&cust_code, &cust_name, &cust_city, &working_area, &cust_country, &grade, &opening_amt,
                        &receive_amt, &payment_amt, &outstanding_amt, &phone_no, &agent_code)
        if err != nil {
            panic(err.Error())
        }
        customer.Cust_name = cust_name
        results = append(results, customer)
    }

    bytes, err := json.Marshal(results)
    if err != nil {
        panic(err)
    }
//     c.WriteMessage(1, bytes)
    defer db.Close()
    return bytes
}

func main() {
    app := fiber.New()

    app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Hello, World! [GO]")
    })

    app.Get("/HelloHTTP", func (c *fiber.Ctx) error {
        return c.SendString("Hello World")
    })

    app.Get("/SqlHTTP", func (c *fiber.Ctx) error {
        log.Printf("start")
        db := dbConn()
        rows, err := db.Query("SELECT * FROM CUSTOMER LIMIT 10")
        if err != nil {
            panic(err.Error())
        }

        customer := Customer{}
        results := []Customer{}
        for rows.Next() {
            var grade int
            var cust_code, cust_name, cust_city, working_area, cust_country, phone_no, agent_code string
            var opening_amt, receive_amt, payment_amt, outstanding_amt float32

            err = rows.Scan(&cust_code, &cust_name, &cust_city, &working_area, &cust_country, &grade, &opening_amt,
                            &receive_amt, &payment_amt, &outstanding_amt, &phone_no, &agent_code)
            if err != nil {
                panic(err.Error())
            }
            customer.Cust_name = cust_name
            results = append(results, customer)
        }

        bytes, err := json.Marshal(results)
        if err != nil {
            panic(err)
        }

        defer db.Close()
        return c.SendString(string(bytes))
    })

    app.Post("/PongHTTP", func (c *fiber.Ctx) error {
        payload := struct {
            Msg string
        }{}

        if err := c.BodyParser(&payload); err != nil {
            return err
        }

        return c.SendString(payload.Msg)
    })

    app.Get("/*", websocket.New(func(c *websocket.Conn) {
      for {
        mtype, msg, err := c.ReadMessage()
        if err != nil {
          break
        }

        switch string(msg) {
            case "HelloWS":
                msg := []byte("Hello World")
                err := c.WriteMessage(1, msg)
                if err != nil {
                  break
                }
            case "SqlWS":
                msg := getCustomers(10)
                err = c.WriteMessage(mtype, msg)
                if err != nil {
                  break
                }
            default:
                err := c.WriteMessage(1, msg)
                if err != nil {
                  break
                }
        }

      }
    }))

    log.Fatal(app.Listen(":80"))
}