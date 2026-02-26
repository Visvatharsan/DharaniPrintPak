module.exports = {
  content: ["./index.html", "./scripts/**/*.js"],
  theme: {
    extend: {
      animation: {
        testspin: "testspin 5s linear infinite",
      },
      keyframes: {
        testspin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
};