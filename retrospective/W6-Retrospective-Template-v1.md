# TEMPLATE FOR RETROSPECTIVE (Team ##)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs done: **3** committed, **7** done
- Total points committed vs done: **7** committed, **7** done
- Nr of hours planned vs spent (as a team): **60h** planned, **56h 30m** done

**Remember** a story is done ONLY if it fits the Definition of Done:

- [x] Unit Tests passing
- [x] Code review completed
- [x] Code present on Git
- [x] End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| 1     | 5       | 3      | 8h 30m     | 8h 46m       |
| 2     | 6       | 2      | 11h        | 9h 15m       |
| 3     | 6       | 2      | 10h        | 8h 35m       |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

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
  - Total hours estimated
  - Total hours spent
  - Nr of automated unit test cases
  - Coverage
- E2E testing:
  - Total hours estimated
  - Total hours spent
  - Nr of test cases
- Code review
  - Total hours estimated
  - Total hours spent

## ASSESSMENT

- What caused your errors in estimation (if any)?

- What lessons did you learn (both positive and negative) in this sprint?

- Which improvement goals set in the previous retrospective were you able to achieve?
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

> Propose one or two

- One thing you are proud of as a Team!!
