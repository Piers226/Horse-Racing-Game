# Horse Racing Game

Welcome to the **Horse Racing Game**, a real-time multiplayer racing game where players can control horses and compete with each other in an exciting race! This game is built using **JavaScript**, **HTML**, and **CSS** for the frontend, while the server-client communication is handled through **WebSockets**.

## Features

- **Real-Time Multiplayer Gameplay**: Players can join a race and control their horse in real-time, competing against others.
- **Smooth Animations**: The horses move with smooth, CSS-based animations to provide a visually appealing experience.
- **WebSocket Communication**: The game uses WebSockets to send and receive real-time data between the server and clients, ensuring fast updates on player positions and race outcomes.
- **Responsive Design**: The game's interface is designed to work on various screen sizes and devices.
- **Game Rounds**: Each game round begins when enough players have joined, and the race results are displayed after each round.

## Technologies Used

- **Frontend**: 
  - **JavaScript**: Handles the game logic, animations, and WebSocket connections.
  - **HTML5**: The structure of the game interface.
  - **CSS3**: For styling and animation effects (e.g., horse movements and background effects).
  
- **Backend**:
  - **Node.js**: The server is built using Node.js to handle WebSocket connections and manage game state.
  - **Socket.IO**: A library that enables real-time, bi-directional communication between the server and clients.

## How It Works

1. **Game Interface**: 
   The user interface consists of a racetrack with several lanes. Each lane represents a player’s horse, and the goal is to reach the finish line first.

2. **Player Controls**:
   Players control their horses by pressing a specific key (e.g., the spacebar or arrow keys), which accelerates the horse along the track. The faster the player presses the key, the quicker their horse moves.

3. **Real-Time Updates**:
   Each player's actions are sent to the server via WebSockets. The server processes the input and updates the game state, broadcasting the position of all horses back to the clients.

4. **Winning Condition**:
   The first horse to cross the finish line wins the race. The server calculates the winner and broadcasts the result to all players, along with a scoreboard update.
