const express = require("express")
const { Deta } = require("deta")

const app = express()
const port = process.env.PORT || 8080

const deta = Deta()
const db = deta.Base("test")

app.get("/", (req, res) => {
  res.send("Hello from Space! 🚀")
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
