export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0f766e",
          mint: "#ccfbf1",
          sand: "#fff7ed",
          clay: "#9a3412"
        }
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 50px -25px rgba(15, 118, 110, 0.28)"
      }
    }
  },
  plugins: []
};
