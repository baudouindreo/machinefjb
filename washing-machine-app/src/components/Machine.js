import React, { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

function Machine({ name, id }) {
  const [isRunning, setIsRunning] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);

  // Fonction pour arrêter la machine, mémorisée avec useCallback
  const handleStop = useCallback(async () => {
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
  }, [id]);

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
        const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes
        const timeLeft = Math.max(data.remaining_time - currentTime, 0); // Calculer le temps restant

        setIsRunning(data.is_running && timeLeft > 0); // Machine active uniquement si temps restant > 0
        setRemainingTime(timeLeft);
      }
    };

    fetchMachineData();

    // Écouter les mises à jour en temps réel
    const subscription = supabase
      .channel("public:machines")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "machines", filter: `id=eq.${id}` }, (payload) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = Math.max(payload.new.remaining_time - currentTime, 0);

        setIsRunning(payload.new.is_running && timeLeft > 0);
        setRemainingTime(timeLeft);
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

          if (newTime <= 0) {
            handleStop(); // Arrêter la machine si le temps est écoulé
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingTime, handleStop]);

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
