## rainfall-rank
### About
![image](https://github.com/user-attachments/assets/5ace96bc-ea75-4331-9f32-8caccf4ac148)
This is a simple web application, written in JavaScript and HTML using the Bootstrap front-end framework, which displays the top 5 major US cities with the highest expected rainfall tomorrow.
### How to run
1. Clone the repository
2. Navigate to the directory of the repo through the terminal
3. Run ```python -m http.server 8000```
4. Navigate to ```http://localhost:8000/``` in your browser
### Notes on implementation
I have set a population limit for the cities being displayed. Only cities with 1 million or more inhabitants are being processed in the application. This was done in order to limit the amount of API calls and to avoid the incurring of costs. 
