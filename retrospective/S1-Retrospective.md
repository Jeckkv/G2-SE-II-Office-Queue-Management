# Sprint 1 Retrospective (Team 2)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs done: **3** committed, **7** done
- Total points committed vs done: **7** committed, **7** done
- Nr of hours planned vs spent (as a team): **60h** planned, **56h 30m** done

Our checklist for DoD:
- [x] Unit Tests passing
- [x] Code review completed
- [x] Code present on Git
- [x] End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| 1     | 5       | 3      | 8h 30m     | 8h 46m       |
| 2     | 6       | 2      | 11h        | 9h 15m       |
| 3     | 6       | 2      | 10h        | 8h 35m       |

- Hours per task average, standard deviation (estimate and actual)

formula Mean: $\frac{\sum_i x_i}{n}$

formula StDev: $\sqrt{\frac{\sum_i(x_i - x_{mean})^2}{n-1}}$

|            | Mean              | StDev          |
| ---------- | ----------------- | -------------- |
| Estimation | 1.76 h <=> 1h 46m | 0.48 h <=> 29m |
| Actual     | 1.42 h <=> 1h 25m | 0.64 h <=> 38m |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$ = $\frac{26.95}{33.5} - 1$ = $-0.196$

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $ = $\frac{1}{19} \left| \frac{26.95}{33.5} - 1 \right|$ = $ 0.010$

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated --> 2h 15m
  - Total hours spent --> 3h
  - Nr of automated unit test cases --> 47
  - Coverage --> 100%
- E2E testing:
  - Total hours estimated --> 3h
  - Total hours spent --> 3h
  - Nr of test cases --> 33
- Code review
  - Total hours estimated --> 3h
  - Total hours spent --> 3h 41m

## ASSESSMENT

- **What caused your errors in estimation (if any)?**

We underestimated the time required for the initial setup, while the UI linking was completed faster than expected, leading to an overestimation of that task.

- **What lessons did you learn (both positive and negative) in this sprint?**

We learned the importance of distributing tasks fairly and functionally to avoid blocking team members and ensure that everyone works on different aspects of the project. We also realized that tasks should be organized to allow team members to work more independently.

Additionally, we learned that preparing the demo should be a dedicated task and that we should avoid completing everything on the last day.

- **Which improvement goals set in the previous retrospective were you able to achieve?**

We successfully completed the first three user stories.

- **Which ones you were not able to achieve? Why?**

We achieved all the improvement goals set in the previous retrospective.

- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**

For the next sprint, we aim to improve task distribution to ensure a balanced workload and greater independence among team members. We also plan to dedicate specific time to preparing the demo, including a full rehearsal before the presentation, and to complete tasks earlier to avoid last-minute work.

- **One thing you are proud of as a Team!!**

We are proud of the amount of work we completed in less than a week. We maintained good communication throughout the sprint, collaborated effectively, and experienced no conflicts within the team.