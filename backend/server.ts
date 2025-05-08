import express = require("express");
import authRoutes = require("./routes/auth");
import woopsRoutes = require("./routes/woops");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", woopsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
