import app from "./app";
// ... and finally server listening
app.listen(5000, err => {
  if (err) throw err;
  console.log(`Server is running on port ${process.env.PORT}`);
});
