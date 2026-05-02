'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  JourneyState,
  Stage,
  Stage1Answers,
  AntiVision,
  LifeVersion,
  IntegratedPlan,
  ActionSuggestion,
  Message,
  Question,
  defaultStage1Answers,
  defaultAntiVision,
  defaultIntegratedPlan,
  stage1Questions,
} from '@/lib/types';

const STORAGE_KEY = 'possibly-life-journey';

type JourneyAction =
  | { type: 'SET_STAGE'; payload: Stage }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_QUESTION'; payload: Question | null }
  | { type: 'UPDATE_ANSWER'; payload: Partial<Stage1Answers> }
  | { type: 'UPDATE_ANTI_VISION'; payload: Partial<AntiVision> }
  | { type: 'SET_LIFE_VERSIONS'; payload: LifeVersion[] }
  | { type: 'UPDATE_LIFE_VERSION'; payload: LifeVersion }
  | { type: 'SET_INTEGRATED_PLAN'; payload: IntegratedPlan }
  | { type: 'SET_ACTION_SUGGESTIONS'; payload: ActionSuggestion[] }
  | { type: 'SET_REPORT'; payload: JourneyState['userData']['report'] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'COMPLETE_STAGE'; payload: 1 | 2 | 3 | 4 }
  | { type: 'LOAD_STATE'; payload: JourneyState }
  | { type: 'RESET' };

const initialState: JourneyState = {
  stage: null,
  step: 0,
  isLoading: false,
  userData: {
    answers: defaultStage1Answers,
    antiVision: defaultAntiVision,
    lifeVersions: [],
    integratedPlan: defaultIntegratedPlan,
    actionSuggestions: [],
    report: null,
  },
  messages: [],
  currentQuestion: null,
  progress: {
    stage1Completed: false,
    stage2Completed: false,
    stage3Completed: false,
    stage4Completed: false,
  },
};

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.payload, step: 0 };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_QUESTION':
      return { ...state, currentQuestion: action.payload };
    case 'UPDATE_ANSWER':
      return {
        ...state,
        userData: {
          ...state.userData,
          answers: { ...state.userData.answers, ...action.payload },
        },
      };
    case 'UPDATE_ANTI_VISION':
      return {
        ...state,
        userData: {
          ...state.userData,
          antiVision: { ...state.userData.antiVision, ...action.payload },
        },
      };
    case 'SET_LIFE_VERSIONS':
      return {
        ...state,
        userData: { ...state.userData, lifeVersions: action.payload },
      };
    case 'UPDATE_LIFE_VERSION':
      return {
        ...state,
        userData: {
          ...state.userData,
          lifeVersions: state.userData.lifeVersions.map((v) =>
            v.id === action.payload.id ? action.payload : v
          ),
        },
      };
    case 'SET_INTEGRATED_PLAN':
      return {
        ...state,
        userData: { ...state.userData, integratedPlan: action.payload },
      };
    case 'SET_ACTION_SUGGESTIONS':
      return {
        ...state,
        userData: { ...state.userData, actionSuggestions: action.payload },
      };
    case 'SET_REPORT':
      return {
        ...state,
        userData: { ...state.userData, report: action.payload },
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'COMPLETE_STAGE':
      return {
        ...state,
        progress: {
          ...state.progress,
          [`stage${action.payload}Completed`]: true,
        },
      };
    case 'LOAD_STATE':
      return action.payload;
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface JourneyContextType {
  state: JourneyState;
  dispatch: React.Dispatch<JourneyAction>;
  // Convenience methods
  startJourney: () => void;
  goToStage: (stage: Stage) => void;
  nextQuestion: () => void;
  submitAnswer: (answer: string | number | string[]) => void;
  saveProgress: () => void;
  loadProgress: () => boolean;
  resetJourney: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialState);

  const saveProgress = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [state]);

  const loadProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as JourneyState;
        dispatch({ type: 'LOAD_STATE', payload: parsed });
        return true;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return false;
  }, []);

  const startJourney = useCallback(() => {
    dispatch({ type: 'SET_STAGE', payload: 1 });
    dispatch({ type: 'SET_STEP', payload: 0 });
    dispatch({ type: 'SET_QUESTION', payload: stage1Questions[0] });
  }, []);

  const goToStage = useCallback((stage: Stage) => {
    dispatch({ type: 'SET_STAGE', payload: stage });
    dispatch({ type: 'SET_STEP', payload: 0 });
    dispatch({ type: 'CLEAR_MESSAGES' });
    
    if (stage === 1) {
      dispatch({ type: 'SET_QUESTION', payload: stage1Questions[0] });
    }
  }, []);

  const nextQuestion = useCallback(() => {
    const currentIndex = stage1Questions.findIndex(
      (q) => q.id === state.currentQuestion?.id
    );
    const nextIndex = currentIndex + 1;

    if (nextIndex < stage1Questions.length) {
      dispatch({ type: 'SET_STEP', payload: nextIndex });
      dispatch({ type: 'SET_QUESTION', payload: stage1Questions[nextIndex] });
    } else {
      // Stage 1 complete
      dispatch({ type: 'COMPLETE_STAGE', payload: 1 });
      dispatch({ type: 'SET_QUESTION', payload: null });
      dispatch({ type: 'SET_STAGE', payload: 2 });
      dispatch({ type: 'SET_STEP', payload: 0 });
    }
  }, [state.currentQuestion]);

  const submitAnswer = useCallback(
    (answer: string | number | string[]) => {
      if (!state.currentQuestion) return;

      const questionId = state.currentQuestion.id;
      let payload: Partial<Stage1Answers> = {};

      switch (questionId) {
        case 'status-score':
          payload = { statusScore: answer as number };
          break;
        case 'energy-sources':
          payload = { energySources: answer as string };
          break;
        case 'choice-dilemma':
          payload = { choiceDilemma: answer as string };
          break;
        case 'fear-visualization':
          payload = { fearVisualization: answer as string };
          break;
        case 'dream-fragments':
          payload = { dreamFragments: answer as string };
          break;
        case 'values':
          payload = { values: answer as string[] };
          break;
        case 'ideal-day':
          payload = { idealDay: answer as string };
          break;
        case 'unique-talent':
          payload = { uniqueTalent: answer as string };
          break;
      }

      dispatch({ type: 'UPDATE_ANSWER', payload });
      nextQuestion();
    },
    [state.currentQuestion, nextQuestion]
  );

  const resetJourney = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    if (state.stage !== 'report') {
      saveProgress();
    }
  }, [state, saveProgress]);

  return (
    <JourneyContext.Provider
      value={{
        state,
        dispatch,
        startJourney,
        goToStage,
        nextQuestion,
        submitAnswer,
        saveProgress,
        loadProgress,
        resetJourney,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
