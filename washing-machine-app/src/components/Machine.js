import React, { useState, useEffect } from "react";

function Machine({ name }) {
  const [isRunning, setIsRunning] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    let timer;
    if (isRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((time) => time - 1);
      }, 1000);
    } else if (remainingTime === 0 && isRunning) {
      setIsRunning(false);
      alert("Cycle terminé !");
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingTime]);

  const handleStart = () => {
    const totalSeconds = hours * 3600 + minutes * 60;
    if (totalSeconds > 0) {
      setRemainingTime(totalSeconds);
      setIsRunning(true);
    } else {
      alert("Veuillez indiquer une durée valide !");
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setRemainingTime(0);
  };

  return (
    <div className="machine-card">
      <img
        src={`https://via.placeholder.com/150?text=${name}`}
        alt={name}
        style={{ marginBottom: "10px" }}
      />
      <h3>{name}</h3>
      {isRunning ? (
        <p>
          Temps restant : {Math.floor(remainingTime / 3600)} h{" "}
          {Math.floor((remainingTime % 3600) / 60)} min{" "}
          {remainingTime % 60} s
        </p>
      ) : (
        <p>Machine libre</p>
      )}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="number"
          placeholder="Heures"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          disabled={isRunning}
          min="0"
        />
        <span>h</span>
        <input
          type="number"
          placeholder="Minutes"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          disabled={isRunning}
          min="0"
        />
        <span>min</span>
      </div>
      <div>
        <button onClick={handleStart} disabled={isRunning}>
          Lancer
        </button>
        <button onClick={handleStop} disabled={!isRunning}>
          Arrêter
        </button>
      </div>
    </div>
  );
}

export default Machine;
