"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import ReactConfetti from "react-confetti";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Trash2, Edit2, Check, X, Calendar, PlusCircle } from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  isOver: boolean;
  showAnimation: boolean;
}

interface TimeLeft {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LOCAL_STORAGE_KEY = "eventCountdownEvents";

export default function EnhancedMultiEventCountdown() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  useEffect(() => {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const stopConfetti = useCallback(() => {
    setShowConfetti(false);
  }, []);

  const sortEvents = useCallback((eventsToSort: Event[]) => {
    return eventsToSort.sort((a, b) => {
      const timeLeftA = calculateTimeLeft(`${a.date}T${a.time}`);
      const timeLeftB = calculateTimeLeft(`${b.date}T${b.time}`);
      const totalSecondsA =
        timeLeftA.months * 30 * 24 * 60 * 60 +
        timeLeftA.days * 24 * 60 * 60 +
        timeLeftA.hours * 60 * 60 +
        timeLeftA.minutes * 60 +
        timeLeftA.seconds;
      const totalSecondsB =
        timeLeftB.months * 30 * 24 * 60 * 60 +
        timeLeftB.days * 24 * 60 * 60 +
        timeLeftB.hours * 60 * 60 +
        timeLeftB.minutes * 60 +
        timeLeftB.seconds;
      return totalSecondsA - totalSecondsB;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((currentEvents) => {
        const updatedEvents = currentEvents.map((event) => {
          const timeLeft = calculateTimeLeft(`${event.date}T${event.time}`);
          const isOver = Object.values(timeLeft).every((value) => value === 0);

          if (isOver && !event.isOver) {
            setShowConfetti(true);
            setTimeout(stopConfetti, 5000);
            return { ...event, isOver: true, showAnimation: true };
          } else if (event.isOver && event.showAnimation) {
            const endTime = dayjs(`${event.date}T${event.time}`);
            const animationEndTime = endTime.add(1, "minute");
            if (dayjs().isAfter(animationEndTime)) {
              return { ...event, showAnimation: false };
            }
          }

          return { ...event, timeLeft };
        });
        return sortEvents(updatedEvents);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stopConfetti, sortEvents]);

  const calculateTimeLeft = (eventDateTime: string): TimeLeft => {
    const now = dayjs();
    const end = dayjs(eventDateTime);
    const diff = end.diff(now, "second");

    if (diff <= 0) {
      return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const months = end.diff(now, "month");
    const days = end.diff(now.add(months, "month"), "day");
    const hours = end.diff(now.add(months, "month").add(days, "day"), "hour");
    const minutes = end.diff(
      now.add(months, "month").add(days, "day").add(hours, "hour"),
      "minute"
    );
    const seconds = end.diff(
      now
        .add(months, "month")
        .add(days, "day")
        .add(hours, "hour")
        .add(minutes, "minute"),
      "second"
    );

    return { months, days, hours, minutes, seconds };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventName && newEventDate && newEventTime) {
      const newEvent: Event = {
        id: Date.now().toString(),
        name: newEventName,
        date: newEventDate,
        time: newEventTime,
        isOver: false,
        showAnimation: false,
      };
      setEvents((currentEvents) => {
        const updatedEvents = sortEvents([...currentEvents, newEvent]);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      setNewEventName("");
      setNewEventDate("");
      setNewEventTime("");
      setShowAddEvent(false);
    }
  };

  const removeEvent = (id: string) => {
    setEvents((currentEvents) => {
      const updatedEvents = currentEvents.filter((event) => event.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
      return updatedEvents;
    });
  };

  const startEditing = (id: string) => {
    setEditingEvent(id);
  };

  const cancelEditing = () => {
    setEditingEvent(null);
  };

  const saveEdit = (
    id: string,
    newName: string,
    newDate: string,
    newTime: string
  ) => {
    setEvents((currentEvents) => {
      const updatedEvents = sortEvents(
        currentEvents.map((event) =>
          event.id === id
            ? {
                ...event,
                name: newName,
                date: newDate,
                time: newTime,
                isOver: false,
                showAnimation: false,
              }
            : event
        )
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
      return updatedEvents;
    });
    setEditingEvent(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 overflow-hidden">
      {showConfetti && (
        <ReactConfetti recycle={false} onConfettiComplete={stopConfetti} />
      )}
      <style jsx global>{`
        .glassmorphism {
          background: rgba(30, 30, 30, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-input {
          transition: all 0.2s ease-in-out;
          background: rgba(50, 50, 50, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1.4rem;
          padding: 1rem 1.25rem;
          border-radius: 7px;
        }
        .custom-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }
        .custom-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .gradient-button {
          background: linear-gradient(45deg, #3a0647, #8b0000);
          transition: all 0.3s ease;
          border-radius: 7px;
        }
        .gradient-button:hover {
          background: linear-gradient(45deg, #4a0657, #9b1010);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <Card className="w-full max-w-3xl glassmorphism shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center border-b border-gray-700">
          <CardTitle className="text-5xl font-bold text-pink-200 border-b-orange-300">
            Event Countdown
          </CardTitle>
          <Button
            onClick={() => setShowAddEvent(!showAddEvent)}
            className="gradient-button text-white transition-all duration-300 text-lg px-6 py-3 flex items-center"
          >
            <PlusCircle className="mr-2 h-6 w-6" /> Add New Event
          </Button>
        </CardHeader>
        <CardContent className="pt-8">
          <AnimatePresence>
            {showAddEvent && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5 mb-8 overflow-hidden"
              >
                <Input
                  type="text"
                  value={newEventName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewEventName(e.target.value)
                  }
                  placeholder="Event Name"
                  className="w-full custom-input text-lg"
                  required
                />
                <div className="flex space-x-3">
                  <Input
                    type="date"
                    value={newEventDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewEventDate(e.target.value)
                    }
                    className="w-1/2 custom-input text-lg"
                    required
                  />
                  <Input
                    type="time"
                    value={newEventTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewEventTime(e.target.value)
                    }
                    className="w-1/2 custom-input text-lg"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-button text-white transition-all duration-300 text-lg py-4"
                >
                  Add Event
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
          <div className="space-y-6">
            <AnimatePresence>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`glassmorphism ${
                      event.isOver && event.showAnimation ? "animate-pulse" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex flex-col">
                          {editingEvent === event.id ? (
                            <Input
                              id={`edit-name-${event.id}`}
                              type="text"
                              defaultValue={event.name}
                              className="custom-input text-lg mb-2"
                            />
                          ) : (
                            <CardTitle className="text-2xl font-semibold text-cyan-300">
                              {event.name}
                            </CardTitle>
                          )}
                          <div className="flex items-center text-lg text-yellow-200 mt-2">
                            <Calendar className="w-5 h-5 mr-2" />
                            {dayjs(`${event.date}T${event.time}`).format(
                              "MMM D, YYYY h:mm A"
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3 sm:mt-0">
                          {editingEvent === event.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="lg"
                                onClick={() =>
                                  saveEdit(
                                    event.id,
                                    (
                                      document.getElementById(
                                        `edit-name-${event.id}`
                                      ) as HTMLInputElement
                                    ).value,
                                    (
                                      document.getElementById(
                                        `edit-date-${event.id}`
                                      ) as HTMLInputElement
                                    ).value,
                                    (
                                      document.getElementById(
                                        `edit-time-${event.id}`
                                      ) as HTMLInputElement
                                    ).value
                                  )
                                }
                                className="text-green-400 hover:text-green-300 transition-colors duration-300"
                              >
                                <Check className="h-6 w-6" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="lg"
                                onClick={cancelEditing}
                                className="text-red-400 hover:text-red-300 transition-colors duration-300"
                              >
                                <X className="h-6 w-6" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="lg"
                              onClick={() => startEditing(event.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                            >
                              <Edit2 className="h-6 w-6" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => removeEvent(event.id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-300"
                          >
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingEvent === event.id ? (
                        <div className="flex space-x-3">
                          <Input
                            id={`edit-date-${event.id}`}
                            type="date"
                            defaultValue={event.date}
                            className="w-1/2 custom-input text-lg"
                          />
                          <Input
                            id={`edit-time-${event.id}`}
                            type="time"
                            defaultValue={event.time}
                            className="w-1/2 custom-input text-lg"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-3 text-center">
                          {Object.entries(
                            calculateTimeLeft(`${event.date}T${event.time}`)
                          ).map(([unit, value]) => (
                            <motion.div
                              key={unit}
                              className="flex flex-col items-center"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <div className="text-3xl font-bold mb-1 text-green-300 h-12 flex items-center justify-center">
                                <motion.span
                                  key={value}
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: -10, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {value.toString().padStart(2, "0")}
                                </motion.span>
                              </div>
                              <span className="text-sm uppercase text-orange-300">
                                {unit}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {event.isOver && event.showAnimation && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className="mt-6 text-center text-2xl font-bold text-pink-300"
                        >
                          Event Completed!
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
