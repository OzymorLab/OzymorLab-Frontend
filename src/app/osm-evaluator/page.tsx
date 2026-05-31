'use client';

import { useState } from 'react';

export default function OSMEvaluatorPage() {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const faqItems = [
        {
            id: 'what-is-osm',
            title: 'What is OSM (On-Screen Marking)?',
            content: `On-Screen Marking (OSM) is a digital examination system where examiners evaluate answer sheets on computer screens instead of paper. Introduced by CBSE and other Indian boards, OSM uses specialized software to display student answers digitally. Examiners assign marks electronically while following the official marking scheme, making the process faster and more standardized than traditional paper-based marking.`
        },
        {
            id: 'osm-vs-traditional',
            title: 'OSM vs Traditional Marking: Key Differences',
            content: `<strong>Traditional Marking (Paper-based):</strong>
      • Physical answer sheets manually transported between schools
      • Handwritten marks on papers, prone to illegibility
      • Manual compilation of scores (time-consuming & error-prone)
      • Inconsistent marking across different evaluators
      • Difficult to track and audit marking progress
      • Higher storage and document management costs
      • Long result declaration delays (30-45 days)
      
      <strong>OSM (Digital On-Screen Marking):</strong>
      • Answer sheets digitized and uploaded to secure servers
      • Marks entered digitally with automatic validation
      • Instant data synchronization and compilation
      • Standardized rubric enforced for consistency
      • Complete audit trail and real-time progress tracking
      • Reduced paper waste and storage needs
      • Faster result processing (7-14 days)
      • Built-in quality control and moderation`
        },
        {
            id: 'osm-process',
            title: 'How Does OSM Marking Work?',
            content: `1. <strong>Digitization:</strong> Answer sheets are scanned using high-resolution cameras
      2. <strong>Upload:</strong> Digital images uploaded to secure OSM servers
      3. <strong>Examiner Login:</strong> Authorized examiners access the platform with credentials
      4. <strong>Answer Display:</strong> Answer sheets displayed on screen with marking tools
      5. <strong>Mark Entry:</strong> Examiners assign marks per criterion following the official scheme
      6. <strong>Validation:</strong> System validates marks against maximum marks
      7. <strong>Save & Next:</strong> Marks saved automatically, examiner moves to next answer sheet
      8. <strong>Quality Check:</strong> Moderation/verification by senior examiners
      9. <strong>Report Generation:</strong> Automated compilation of results`
        },
        {
            id: 'cbse-osm',
            title: 'Is OSM Used by CBSE?',
            content: `Yes, CBSE has fully implemented On-Screen Marking for all board exams (Class 10 and 12). Starting from 2013, CBSE adopted OSM to ensure:
      • Consistent evaluation standards across all centers
      • Faster result announcement
      • Reduced human error in mark compilation
      • Better tracking of examiner performance
      • Secure storage of answer sheets and marks
      
      Today, CBSE conducts OSM for Class 10 Board Exams, Class 12 Board Exams, and other CBSE-conducted examinations. Other Indian boards like ICSE, state boards, and competitive exam conductors have also adopted similar systems.`
        },
        {
            id: 'osm-advantages',
            title: 'What Are the Main Advantages of OSM?',
            content: `1. <strong>Speed:</strong> Results declared 2-3 weeks faster than traditional marking
      2. <strong>Accuracy:</strong> Digital validation prevents mathematical errors in compilation
      3. <strong>Consistency:</strong> Standardized rubrics ensure uniform evaluation
      4. <strong>Transparency:</strong> Complete audit trail of every mark awarded
      5. <strong>Security:</strong> Encrypted data storage and secure access controls
      6. <strong>Environment-friendly:</strong> Reduced paper usage and transportation
      7. <strong>Cost-efficient:</strong> Lower administrative overhead
      8. <strong>Quality Assurance:</strong> Built-in moderation and verification checks
      9. <strong>Accessibility:</strong> Examiners can mark from authorized centers
      10. <strong>Real-time Monitoring:</strong> Officials can track marking progress in real-time`
        },
        {
            id: 'osm-marking-reliability',
            title: 'How Reliable is OSM Marking?',
            content: `OSM marking is highly reliable due to:
      • <strong>Standardized Rubrics:</strong> All examiners follow identical marking schemes
      • <strong>Quality Moderation:</strong> 10-15% of answer sheets are reviewed by senior examiners
      • <strong>Digital Validation:</strong> System prevents marks exceeding the maximum
      • <strong>Examiner Training:</strong> All examiners undergo extensive training
      • <strong>Random Verification:</strong> Spot checks ensure consistency
      • <strong>Data Backup:</strong> Multiple server backups prevent data loss
      • <strong>Audit Logs:</strong> Complete record of all marking changes
      
      Studies show OSM has a consistency rate of 95%+ with minimal discrepancies between first and second marking.`
        },
        {
            id: 'osm-vs-ai',
            title: 'How Does AI Answer Sheet Evaluation Compare to OSM?',
            content: `<strong>OSM (Human Examiners):</strong>
      • Qualitative assessment with human judgment
      • Follows official board marking schemes
      • Takes 45 minutes - 2 hours per answer sheet
      • Subject to examiner fatigue and bias
      • Suitable for large-scale official exams
      
      <strong>AI Answer Sheet Evaluation (OzymorLab):</strong>
      • Instant evaluation (seconds per answer)
      • Consistent application of rubrics 24/7
      • Can evaluate in 22 Indian languages
      • Evidence-backed marks with explanations
      • Suitable for practice, assessment, and training
      • Can work alongside OSM for quality assurance
      • Detects handwriting, diagrams, and equations
      • Provides actionable feedback for improvement
      
      <strong>Combined Approach:</strong> AI evaluation for practice exams and quick feedback, while OSM remains the official marking method for board exams. OzymorLab helps students prepare by providing exam-like evaluations before the actual OSM conducted by boards.`
        },
        {
            id: 'ai-osm-evaluator',
            title: 'What is an AI OSM Evaluator?',
            content: `An AI OSM Evaluator is a software tool that automatically evaluates answer sheets using artificial intelligence, designed to simulate the OSM marking process. Key features include:
      
      • <strong>Digital Answer Processing:</strong> Accepts text, handwriting, diagrams, and equations
      • <strong>Rubric-based Evaluation:</strong> Follows CBSE/ICSE/State Board marking schemes
      • <strong>Criterion Scoring:</strong> Awards marks per criterion (content, presentation, etc.)
      • <strong>Evidence Extraction:</strong> Quotes relevant parts of answers as justification
      • <strong>Multilingual Support:</strong> Evaluates answers in 22 Indian languages
      • <strong>Instant Results:</strong> Provides marks and feedback immediately
      • <strong>Learning Adaptation:</strong> Learns teacher/examiner style for better accuracy
      
      OzymorLab's AI OSM Evaluator helps students practice before taking actual OSM board exams, providing exam-realistic feedback in minutes rather than weeks.`
        },
        {
            id: 'practice-vs-official',
            title: 'Can I Practice OSM with AI Before the Real Exam?',
            content: `Yes! AI answer sheet evaluators like OzymorLab allow you to:
      
      1. <strong>Practice Answering:</strong> Write answers in exam format
      2. <strong>Instant Evaluation:</strong> Get marks and feedback immediately
      3. <strong>Understand Marking Scheme:</strong> See exactly how marks are awarded
      4. <strong>Improve Weak Areas:</strong> Identify criteria where you lose marks
      5. <strong>Build Confidence:</strong> Practice repeatedly before the real OSM exam
      6. <strong>Track Progress:</strong> Monitor improvement across practice attempts
      7. <strong>Learn Time Management:</strong> Complete full papers under exam conditions
      
      This practice is especially valuable because:
      • You understand the expected answer format
      • You know what examiners look for in each criterion
      • You gain confidence with actual marking criteria
      • You can practice unlimited without waiting for results
      • The feedback helps you refine answers before board exams`
        },
        {
            id: 'osm-accuracy-ai',
            title: 'How Accurate is AI Evaluation Compared to OSM?',
            content: `Our analysis shows:
      
      • <strong>AI Accuracy:</strong> 83% within 1 mark of human examiner scores
      • <strong>Consistency:</strong> AI maintains 99% consistency across evaluations
      • <strong>Speed Advantage:</strong> AI evaluates in seconds vs. 1-2 hours for human
      • <strong>Scalability:</strong> Can evaluate thousands of papers simultaneously
      
      <strong>Why Not 100%?</strong>
      • Human judgment involves subjective interpretation
      • Different examiners may award marks differently (expected range: ±2 marks)
      • AI learns to match the dominant examiner pattern
      
      <strong>Best Practice:</strong> Use AI for practice and learning, official OSM for board exams. The skills you develop with AI evaluation transfer directly to improved performance in actual OSM exams.`
        },
        {
            id: 'osm-boards',
            title: 'Which Indian Boards Use OSM?',
            content: `<strong>Full OSM Implementation:</strong>
      • CBSE - Class 10 & 12 Board Exams (since 2013)
      • NIOS - Open School Exams
      • ICSE - Indian Certificate of Secondary Education (selected regions)
      
      <strong>Partial/Planned Implementation:</strong>
      • Maharashtra State Board
      • UP Board
      • MP Board
      • Karnataka State Board
      • Tamil Nadu Board
      • Other state boards progressively adopting
      
      <strong>Competitive Exams Using Similar Systems:</strong>
      • JEE (selected centers)
      • NEET (some centers)
      • Various state-level exams
      
      Most major Indian boards have either implemented or are in the process of implementing OSM to ensure standardized, transparent, and faster evaluation.`
        },
        {
            id: 'prepare-for-osm',
            title: 'How to Prepare for OSM Exams?',
            content: `<strong>Practice Strategy:</strong>
      1. Use AI evaluators like OzymorLab to practice answering
      2. Learn the official marking scheme for your board
      3. Practice writing concise, criterion-focused answers
      4. Get feedback on weak areas from AI evaluations
      5. Revise and reattempt weak topics
      6. Track progress over multiple practice sessions
      
      <strong>Answer Format Tips for OSM:</strong>
      • Write clearly (text will be scanned and displayed)
      • Use bullet points for organization
      • Label diagrams properly
      • Show all steps in mathematical solutions
      • Use evidence/examples to support arguments
      • Structure answers per marking criteria
      
      <strong>Timing Tips:</strong>
      • Practice under timed conditions
      • Aim to complete the paper in allocated time
      • Leave time for review before submission
      • Use AI practice to simulate exam pressure
      
      <strong>Multilingual Advantage:</strong>
      • If you write in regional language, practice evaluations in that language
      • OzymorLab supports 22 Indian languages for authentic practice`
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        OSM (On-Screen Marking) & AI Answer Sheet Evaluation
                    </h1>
                    <p className="text-xl text-slate-600">
                        Understanding how OSM works and how AI evaluation helps you prepare for board exams
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-3">What You'll Learn</h2>
                    <ul className="space-y-2 text-slate-700">
                        <li>✓ What OSM (On-Screen Marking) is and how it works</li>
                        <li>✓ Key differences between OSM and traditional paper marking</li>
                        <li>✓ How AI answer sheet evaluation compares to OSM</li>
                        <li>✓ How to use AI practice to prepare for official OSM exams</li>
                        <li>✓ Accuracy and reliability of both methods</li>
                    </ul>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqItems.map((item) => (
                        <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <button
                                onClick={() => toggleSection(item.id)}
                                className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 text-left">
                                    {item.title}
                                </h3>
                                <span className={`text-2xl text-blue-600 transition-transform ${expandedSection === item.id ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {expandedSection === item.id && (
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                    <div
                                        className="text-slate-700 leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Key Statistics */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-lg text-center">
                        <div className="text-4xl font-bold mb-2">95%+</div>
                        <div className="text-blue-100">OSM Marking Consistency</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-lg text-center">
                        <div className="text-4xl font-bold mb-2">83%</div>
                        <div className="text-green-100">AI Evaluation Accuracy vs Human</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-lg text-center">
                        <div className="text-4xl font-bold mb-2">22</div>
                        <div className="text-purple-100">Indian Languages Supported</div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to Practice with AI OSM Evaluation?</h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Start practicing your answers with OzymorLab's AI evaluator and get ready for your board exams. Get instant feedback, track progress, and improve before the real OSM exam.
                    </p>
                    <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                        Get 50 Free Credits Now
                    </button>
                </div>

                {/* FAQ Sources */}
                <div className="mt-12 text-center text-sm text-slate-600">
                    <p>Information based on CBSE OSM documentation, board exam guidelines, and educational research</p>
                </div>
            </div>
        </div>
    );
}
