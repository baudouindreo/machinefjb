import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function Machine({ name, id }) {
  const [isRunning, setIsRunning] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Charger l'état initial depuis Supabase
    const fetchMachineData = async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur lors du chargement des données :", error);
      } else if (data) {
        setIsRunning(data.is_running);
        setRemainingTime(data.remaining_time - Math.floor(Date.now() / 1000)); // Ajuster en fonction de l'heure actuelle
      }
    };

    fetchMachineData();

    // Écouter les mises à jour en temps réel
    const subscription = supabase
      .channel("public:machines")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "machines", filter: `id=eq.${id}` }, (payload) => {
        setIsRunning(payload.new.is_running);
        setRemainingTime(payload.new.remaining_time - Math.floor(Date.now() / 1000)); // Ajuster en fonction de l'heure actuelle
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  useEffect(() => {
    let timer;
    if (isRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((time) => {
          const newTime = time - 1;

          // Mettre à jour Supabase
          supabase
            .from("machines")
            .update({
              remaining_time: Math.max(0, newTime + Math.floor(Date.now() / 1000)),
              is_running: newTime > 0,
            })
            .eq("id", id);

          return newTime;
        });
      }, 1000);
    } else if (remainingTime === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingTime, id]);

  const handleStart = async () => {
    const totalHours = parseInt(hours, 10) || 0;
    const totalMinutes = parseInt(minutes, 10) || 0;
    const totalSeconds = totalHours * 3600 + totalMinutes * 60;

    if (totalSeconds > 0) {
      const currentTimeUTC = Math.floor(Date.now() / 1000); // Heure actuelle en secondes UTC
      const adjustedTime = currentTimeUTC + totalSeconds; // Temps ajusté

      setIsRunning(true);
      setRemainingTime(totalSeconds);

      // Mettre à jour Supabase
      const { error } = await supabase
        .from("machines")
        .update({
          is_running: true,
          remaining_time: adjustedTime, // Enregistrer en UTC
        })
        .eq("id", id);

      if (error) {
        console.error("Erreur lors de la mise à jour :", error);
      }
    } else {
      alert("Veuillez indiquer une durée valide !");
    }
  };

  const handleStop = async () => {
    setIsRunning(false);
    setRemainingTime(0);

    // Mettre à jour Supabase
    const { error } = await supabase
      .from("machines")
      .update({
        is_running: false,
        remaining_time: 0,
      })
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de l'arrêt :", error);
    }
  };

  return (
    <div className="machine-card">
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
          onChange={(e) => setHours(e.target.value)}
          disabled={isRunning}
          min="0"
        />
        <span>h</span>
        <input
          type="number"
          placeholder="Minutes"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
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
