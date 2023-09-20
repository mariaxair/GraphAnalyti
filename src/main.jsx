import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { motion } from "framer-motion";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <motion.div
  
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.9 }}
  >

    <App />
  </motion.div>
);
