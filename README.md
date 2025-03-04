# webscraper-api
as of now it is scrapping whole data 
9:524th march 2025

📂 Code Structure
	1.	Imports & Setup
	•	Express is used to create the API.
	•	Puppeteer is used to launch a headless browser for web scraping.
	•	The app runs on port 3000 (or a port defined in process.env.PORT).
	2.	API Route (/scrape)
	•	Accepts a query parameter url (the webpage to scrape).
	•	Uses Puppeteer to load the webpage.
	•	Extracts all text content (including iframes).
	•	Returns the text as JSON response.
