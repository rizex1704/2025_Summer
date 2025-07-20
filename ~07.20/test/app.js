const express = require('express');
const app = express();
const port = 5000;

app.listen(port, () => {
    console.log(`server running: http://localhost:${port}`);
})
app.get("/", (request, response) => {
    response.send("success");
});
require("./routes/test.routes")(app);