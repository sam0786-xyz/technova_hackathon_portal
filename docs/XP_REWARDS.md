# **XP Rewards System Documentation**

## **Overview**

The Technova XP Rewards System assigns experience points (XP) to students based on their participation in events. XP contributes to leaderboard rankings and encourages meaningful engagement, consistency, and participation across activities.

This document defines the XP calculation model, reward categories, and operational rules.

---

## **XP Calculation Model**

XP for each participant is calculated using the following formula:

```
Final XP = Base XP × Duration Multiplier × Difficulty Multiplier
```

This ensures that reward distribution fairly reflects the event’s type, duration, and complexity.

---

## **Base XP by Event Type**

Base XP is determined by the nature of the event.

| Event Type     | Base XP | Description                                                              |
| -------------- | ------- | ------------------------------------------------------------------------ |
| Talk / Seminar | 50 XP   | Knowledge-sharing and learning-focused sessions                          |
| Workshop       | 80 XP   | Practical, hands-on learning activities                                  |
| Competition    | 100 XP  | Structured competitive activities lasting less than 12 hours             |
| Hackathon      | 150 XP  | High-effort competitive events typically spanning 12 to 24 hours or more |

---

## **Duration Multiplier**

Duration multipliers ensure that longer events are rewarded proportionally.

| Duration              | Multiplier |
| --------------------- | ---------- |
| ≤ 1 hour              | ×1.0       |
| 1–2 hours             | ×1.2       |
| 2–4 hours             | ×1.5       |
| Full day (4–24 hours) | ×2.0       |
| Multi-day             | ×3.0       |

---

## **Difficulty Multiplier**

Difficulty multipliers account for the preparation level and complexity required to participate.

| Level    | Multiplier | Description                                                   |
| -------- | ---------- | ------------------------------------------------------------- |
| Easy     | ×1.0       | No prerequisite required                                      |
| Moderate | ×1.3       | Basic prerequisite required                                   |
| Hard     | ×1.6       | Requires strong prerequisite knowledge or skill               |
| Elite    | ×2.0       | Advanced challenge level (primarily applicable to hackathons) |

---

## **Example XP Calculations**

The following examples illustrate sample XP awards:

| Event                       | Calculation     | XP Awarded |
| --------------------------- | --------------- | ---------- |
| 1-hour Workshop (Easy)      | 80 × 1.0 × 1.0  | 80 XP      |
| 3-hour Competition (Hard)   | 100 × 1.5 × 1.6 | 240 XP     |
| Full-day Seminar (Moderate) | 50 × 2.0 × 1.3  | 130 XP     |
| Multi-day Hackathon (Elite) | 150 × 3.0 × 2.0 | 900 XP     |

---

## **Daily XP Distribution**

For events spanning multiple days, XP is **distributed daily** rather than awarded all at once. This encourages consistent participation throughout the event.

### **How It Works**

1. **Total XP is calculated** using the standard formula
2. **Daily XP is computed**: `Daily XP = Total XP ÷ Number of Event Days`
3. **Participants earn XP each day** they check in to the event
4. **Missed days = lost XP** — each day's XP chunk is only available on that day

### **Example: 3-Day Hackathon (Elite)**

| Metric        | Value                |
| ------------- | -------------------- |
| Total XP      | 900 XP               |
| Event Days    | 3                    |
| Daily XP      | 300 XP/day           |
| Day 1 Check-in | +300 XP             |
| Day 2 Missed  | 0 XP (lost)          |
| Day 3 Check-in | +300 XP             |
| **Total Earned** | **600 XP**       |

> **Note:** On the final check-in day, any remaining XP is awarded to ensure no rounding loss.

---

## **Earning XP**

Students earn XP through verified participation in events.

### **Process**

1. Register for an event
2. Attend the event
3. Complete attendance verification (e.g., QR check-in)
4. XP is automatically assigned upon successful verification

---

## **Leaderboard**

All earned XP contributes to the Technova leaderboard.
Participants can view rankings at:

```
/leaderboard
```

Top performers are highlighted with additional visibility.

---

## **Notes**

* XP is awarded only for verified attendance
* Duplicate XP allocation is prevented
* Policies may evolve based on future system enhancements

