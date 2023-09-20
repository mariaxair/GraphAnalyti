/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "matrice": "#d0b79d",
        "button":'#ad5038',
        "button-hover":'#3a2124',
        "darkDivInput":'rgba(77, 187, 148, 0.631)',
        "darkDiv":'rgba(86, 93, 135, 2)',
        "lightDivInput":'#52dfae51',
        "lightDiv":'#8592de68',
        },
    },
    fontFamily:{
      'myFont': ['Maven Pro',  'sans-serif'],
      'default':['sans-serif']
    },

    
  },
  
  plugins: [],
}