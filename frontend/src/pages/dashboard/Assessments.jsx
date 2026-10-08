import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, Activity, Brain, Moon, Coffee } from 'lucide-react';
import AssessmentCard from '../../components/dashboard/AssessmentCard';
import AssessmentForm from '../../components/dashboard/AssessmentForm';
import AssessmentResults from '../../components/dashboard/AssessmentResults';

const ASSESSMENTS = [
  {
    id: 'phq9',
    title: 'PHQ-9 Depression Assessment',
    description: 'A clinically validated questionnaire to screen, diagnose, monitor and measure the severity of depression.',
    timeEstimate: '5 mins',
    questionsCount: 9,
    icon: Brain,
    color: 'from-blue-500 to-indigo-500',
    questions: [
      { text: 'Little interest or pleasure in doing things', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Feeling down, depressed, or hopeless', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Trouble falling or staying asleep, or sleeping too much', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Feeling tired or having little energy', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Poor appetite or overeating', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Feeling bad about yourself or that you are a failure', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Trouble concentrating on things, such as reading or watching TV', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Moving or speaking so slowly that other people could have noticed', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Thoughts that you would be better off dead, or of hurting yourself', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
    ]
  },
  {
    id: 'gad7',
    title: 'GAD-7 Anxiety Assessment',
    description: 'A widely used questionnaire for screening and measuring the severity of generalized anxiety disorder.',
    timeEstimate: '3 mins',
    questionsCount: 7,
    icon: Activity,
    color: 'from-orange-500 to-red-500',
    questions: [
      { text: 'Feeling nervous, anxious or on edge', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Not being able to stop or control worrying', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Worrying too much about different things', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Trouble relaxing', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Being so restless that it is hard to sit still', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Becoming easily annoyed or irritable', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
      { text: 'Feeling afraid as if something awful might happen', options: [{text: 'Not at all', score: 0}, {text: 'Several days', score: 1}, {text: 'More than half the days', score: 2}, {text: 'Nearly every day', score: 3}] },
    ]
  },
  {
    id: 'stress',
    title: 'Perceived Stress Test',
    description: 'Measures the degree to which situations in your life are appraised as stressful.',
    timeEstimate: '4 mins',
    questionsCount: 10,
    icon: ClipboardList,
    color: 'from-purple-500 to-pink-500',
    questions: [
      { text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', options: [{text: 'Never', score: 0}, {text: 'Almost Never', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 3}, {text: 'Very Often', score: 4}] },
      { text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', options: [{text: 'Never', score: 0}, {text: 'Almost Never', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 3}, {text: 'Very Often', score: 4}] },
      { text: 'In the last month, how often have you felt nervous and "stressed"?', options: [{text: 'Never', score: 0}, {text: 'Almost Never', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 3}, {text: 'Very Often', score: 4}] },
      { text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', options: [{text: 'Never', score: 4}, {text: 'Almost Never', score: 3}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 1}, {text: 'Very Often', score: 0}] },
      { text: 'In the last month, how often have you felt that things were going your way?', options: [{text: 'Never', score: 4}, {text: 'Almost Never', score: 3}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 1}, {text: 'Very Often', score: 0}] },
      { text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', options: [{text: 'Never', score: 0}, {text: 'Almost Never', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 3}, {text: 'Very Often', score: 4}] },
      { text: 'In the last month, how often have you been able to control irritations in your life?', options: [{text: 'Never', score: 4}, {text: 'Almost Never', score: 3}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 1}, {text: 'Very Often', score: 0}] },
      { text: 'In the last month, how often have you felt that you were on top of things?', options: [{text: 'Never', score: 4}, {text: 'Almost Never', score: 3}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 1}, {text: 'Very Often', score: 0}] },
      { text: 'In the last month, how often have you been angered because of things that were outside of your control?', options: [{text: 'Never', score: 0}, {text: 'Almost Never', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 3}, {text: 'Very Often', score: 4}] },
      { text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', options: [{text: 'Never', score: 0}, {text: 'Almost Never', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Fairly Often', score: 3}, {text: 'Very Often', score: 4}] },
    ]
  },
  {
    id: 'sleep',
    title: 'Sleep Quality Assessment',
    description: 'Evaluate your sleep patterns and identify potential areas for improvement.',
    timeEstimate: '2 mins',
    questionsCount: 5,
    icon: Moon,
    color: 'from-indigo-500 to-cyan-500',
    questions: [
      { text: 'How would you rate your overall sleep quality?', options: [{text: 'Excellent', score: 0}, {text: 'Good', score: 1}, {text: 'Fair', score: 2}, {text: 'Poor', score: 3}] },
      { text: 'How long does it usually take you to fall asleep at night?', options: [{text: 'Less than 15 minutes', score: 0}, {text: '16-30 minutes', score: 1}, {text: '31-60 minutes', score: 2}, {text: 'More than 60 minutes', score: 3}] },
      { text: 'How often do you wake up in the middle of the night or early morning?', options: [{text: 'Not during the past month', score: 0}, {text: 'Less than once a week', score: 1}, {text: 'Once or twice a week', score: 2}, {text: 'Three or more times a week', score: 3}] },
      { text: 'How often do you have trouble staying awake while driving, eating meals, or engaging in social activity?', options: [{text: 'Not during the past month', score: 0}, {text: 'Less than once a week', score: 1}, {text: 'Once or twice a week', score: 2}, {text: 'Three or more times a week', score: 3}] },
      { text: 'How many hours of actual sleep do you get at night?', options: [{text: 'More than 7 hours', score: 0}, {text: '6-7 hours', score: 1}, {text: '5-6 hours', score: 2}, {text: 'Less than 5 hours', score: 3}] },
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Assessment',
    description: 'A holistic look at your daily habits including diet, exercise, and work-life balance.',
    timeEstimate: '5 mins',
    questionsCount: 8,
    icon: Coffee,
    color: 'from-green-500 to-teal-500',
    questions: [
      { text: 'How many days per week do you engage in moderate to vigorous physical activity?', options: [{text: '5+ days', score: 0}, {text: '3-4 days', score: 1}, {text: '1-2 days', score: 2}, {text: '0 days', score: 3}] },
      { text: 'How often do you eat balanced meals containing vegetables, fruits, and lean proteins?', options: [{text: 'Most meals', score: 0}, {text: 'Some meals', score: 1}, {text: 'Rarely', score: 2}, {text: 'Never', score: 3}] },
      { text: 'How many glasses of water do you drink per day?', options: [{text: '8 or more', score: 0}, {text: '5-7 glasses', score: 1}, {text: '2-4 glasses', score: 2}, {text: 'Less than 2', score: 3}] },
      { text: 'How often do you consume caffeine or energy drinks late in the day?', options: [{text: 'Never', score: 0}, {text: 'Rarely', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Often', score: 3}] },
      { text: 'How often do you feel you have a good balance between work/school and personal life?', options: [{text: 'Always', score: 0}, {text: 'Most of the time', score: 1}, {text: 'Sometimes', score: 2}, {text: 'Rarely or never', score: 3}] },
      { text: 'How much time do you spend on screens (excluding work/school) per day?', options: [{text: 'Less than 2 hours', score: 0}, {text: '2-4 hours', score: 1}, {text: '4-6 hours', score: 2}, {text: 'More than 6 hours', score: 3}] },
      { text: 'How often do you engage in hobbies or activities you enjoy?', options: [{text: 'Daily', score: 0}, {text: 'A few times a week', score: 1}, {text: 'A few times a month', score: 2}, {text: 'Rarely', score: 3}] },
      { text: 'How often do you connect socially with friends or family?', options: [{text: 'Daily', score: 0}, {text: 'A few times a week', score: 1}, {text: 'A few times a month', score: 2}, {text: 'Rarely', score: 3}] },
    ]
  }
];

const Assessments = () => {
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [results, setResults] = useState(null);
  
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get('open');
    if (openId) {
      const found = ASSESSMENTS.find(a => a.id === openId);
      if (found) {
        setActiveAssessment(found);
      }
    }
  }, [location.search]);

  const handleStart = (assessment) => {
    setActiveAssessment(assessment);
    setResults(null);
  };

  const handleComplete = (score, answers) => {
    setResults({ score, answers });
  };

  const handleCancel = () => {
    setActiveAssessment(null);
    setResults(null);
  };

  const handleRetake = () => {
    setResults(null);
  };

  return (
    <div className="w-full">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Clinical Assessments
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-5 max-w-xl">
          Clinically validated self-report tools used by healthcare providers worldwide. Each assessment takes 2–5 minutes and gives you an instant risk score with personalised recommendations.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '5 Assessments', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' },
            { label: 'Clinically Validated (PHQ-9 · GAD-7 · PSS)', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
            { label: '2–5 mins each', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
          ].map(({ label, color }) => (
            <span key={label} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${color}`}>{label}</span>
          ))}
        </div>
      </div>

      {!activeAssessment && !results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {ASSESSMENTS.map(assessment => (
            <AssessmentCard
              key={assessment.id}
              {...assessment}
              onClick={() => handleStart(assessment)}
            />
          ))}
        </div>
      )}

      {activeAssessment && !results && (
        <AssessmentForm
          assessment={activeAssessment}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}

      {activeAssessment && results && (
        <AssessmentResults
          assessment={activeAssessment}
          score={results.score}
          onRetake={handleRetake}
          onBack={handleCancel}
        />
      )}
    </div>
  );
};

export default Assessments;
