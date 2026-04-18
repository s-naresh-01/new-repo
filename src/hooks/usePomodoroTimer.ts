import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from '../store';
import {tickTimer, completeTimer} from '../store/slices/focusSlice';
import {showFocusCompleteNotification} from '../services/notifications';
import {database, focusSessionsCollection} from '../database';

export const usePomodoroTimer = () => {
  const dispatch = useAppDispatch();
  const {isRunning, remainingSeconds, currentType, sessionStartedAt, currentTaskId} =
    useAppSelector(s => s.focus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, dispatch]);

  useEffect(() => {
    if (remainingSeconds === 0 && isRunning) {
      dispatch(completeTimer());
      showFocusCompleteNotification(currentType);

      if (currentType === 'pomodoro' && sessionStartedAt) {
        const duration = Math.round((Date.now() - sessionStartedAt) / 60000);
        database.write(async () => {
          await focusSessionsCollection.create(s => {
            s.taskId = currentTaskId || '';
            s.startedAt = sessionStartedAt;
            s.duration = duration;
            s.type = currentType;
          });
        });
      }
    }
  }, [remainingSeconds, isRunning, currentType, sessionStartedAt, currentTaskId, dispatch]);
};
