const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const app = express();

const PORT = 3005;

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
})

app.use(morgan("combined"));

app.use(limiter)


app.use("/api", async (req, res, next) => {
    try {
        const response = await axios.get("http://localhost:3003/api/v1/isauthenticated", {
            headers: {
                "x-access-token": req.headers["x-access-token"]
            }
        });
        if(response.data.success) {
            console.log("authenticated");
            next();
        }   
    } catch (error) {
        return res.status(401).json({message: "something went wrong"}); 
    }
});

app.use('/api', createProxyMiddleware({ target: 'http://localhost:3001/', changeOrigin: true }));

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});