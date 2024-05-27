import { ChangeEvent, useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import chess from "./assets/chess.jpg";
type SortOrder = "asc" | "desc" | "";
interface PlayerDetails {
  player_id: number;
  avatar: string;
  name: string;
  url: string;
  country: string;
  league: string;
  joined: number;
  status: string;
  last_online: number;
}
const App = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [filteredPlayers, setFilteredPlayers] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetails | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    axios
      .get("https://api.chess.com/pub/titled/GM", { signal })
      .then((res) => {
        setPlayers(res.data.players);
        setFilteredPlayers(res.data.players);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(error.message);
        }
      });
    return () => controller.abort();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
    setFilteredPlayers(
      players.filter((player) =>
        player.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };
  const sortPlayers = (players: string[], order: SortOrder) => {
    return players.slice().sort((a, b) => {
      if (order === "asc") {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });
  };
  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    setFilteredPlayers(sortPlayers(filteredPlayers, newOrder));
  };
  const handleDetails = async (player: string) => {
    try {
      const response = await axios.get<PlayerDetails>(
        `https://api.chess.com/pub/player/${player}`
      );
      setSelectedPlayer(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("failed to fetch player details", error);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };
  const now = Date.now();
  let timeOnlineMessage: string | undefined;
  const unixTimestamp: number | undefined = selectedPlayer?.last_online;
  if (unixTimestamp !== undefined) {
    const timeOnline = now - unixTimestamp * 1000;
    const timeOnlineInhours = timeOnline / (1000 * 60 * 60);
    timeOnlineMessage = `Time online: ${timeOnlineInhours} hours`;
  } else {
    timeOnlineMessage = "Last online time not available for the player.";
  }

  return (
    <div className="justify-center m-12 text-center  ">
      <header className="">
        <h1 className="text-yellow-400 ">ChessMasters</h1>
      </header>
      <main>
        <div className="flex flex-row ">
          <img src={chess} alt="" className="w-1/3 " />
          <img src={chess} alt="" className="w-1/3 " />
          <img src={chess} alt="" className="w-1/3 " />
        </div>
        <div>
          <input
            className="p-2 w-48 m-2 bg-slate-200 rounded-md"
            type="text"
            placeholder="search..."
            value={filter}
            onChange={handleChange}
          />
          <hr className="p-2 m-2 " />
          <button
            onClick={handleSort}
            className="p-2 w-48 m-2 bg-slate-200 rounded-md text-blue-900 font-bold"
          >
            Ordenar: {sortOrder === "asc" ? "Desendiente" : "Acendente"}
          </button>
        </div>
        <div className="p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((item, index) => (
              <div
                className=" cursor-pointer text-blue-500 bg-slate-900 w-60% p-2 rounded-md border-red-500 border-2 outline-2 m-2"
                key={index}
                onClick={() => handleDetails(item)}
              >
                {item}
              </div>
            ))
          ) : (
            <li>loading...</li>
          )}
        </div>
      </main>
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="relative bg-gray-400 p-4 rounded-md w-1/3 flex flex-col items-center">
            <button
              className="absolute right-4  m-6 p-2 bg-red-500 text-white rounded-full"
              onClick={closeModal}
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedPlayer.name}</h2>
            <h3 className="m-2">Status: {selectedPlayer.status}</h3>
            {selectedPlayer.avatar && (
              <img
                src={selectedPlayer.avatar}
                alt={selectedPlayer.name}
                className="mb-4"
              />
            )}
            {timeOnlineMessage && <p>{timeOnlineMessage}</p>}
            <p>
              <a
                href={selectedPlayer.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Profile Link
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
