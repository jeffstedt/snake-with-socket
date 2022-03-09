import { useEffect, useState } from "react";
import { EVENT, MSG, socket } from "./Api";
import Canvas from "./Canvas";

type Running = string;
type ServerStatus = "Idle" | Running;

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>("Idle");
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    socket.on(MSG.CONNECT, () => {
      setServerStatus(socket.id);

      // Try to start the game
      socket.emit(MSG.INITIALIZE, {
        id: socket.id,
        // Color could be a fun input before starting the game
        color: "#00FF00",
        position: { x: 250, y: 250 },
      });

      // Listen and emit keydown events
      window.addEventListener("keydown", (event) => {
        socket.emit(EVENT.POSITION_UPDATE, event.key);
      });

      // Listen to game updates and save them in our state
      socket.on(EVENT.STATE_UPDATE, (players) => {
        setPlayers(players);
      });
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {serverStatus === "Idle" ? (
          "Could not connect to socket server"
        ) : (
          <div>
            <div>
              <p>
                Connected to server on <code>{serverStatus}</code>
              </p>
            </div>
            {players ? <Canvas players={players} /> : "Loading..."}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
