cat > src/utils/nursingSampleData.ts << 'EOF'
import { useScheduleStore } from '../stores/useScheduleStore';

export const initializeNursingSampleData = () => {
  const store = useScheduleStore.getState();
  
  // First, create the courses
  const courses = [
    {
      name: 'Adult Health Nursing',
      code: 'Adult_310',
      professor: 'TBD',
      credits: 6,
      color: '#3b82f6',
      schedule: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:05', type: 'lecture' as const },
        { dayOfWeek: 3, startTime: '07:00', endTime: '17:00', type: 'lab' as const }
      ]
    },
    {
      name: 'Gerontological Nursing',
      code: 'Gerontology_315',
      professor: 'TBD',
      credits: 3,
      color: '#10b981',
      schedule: [
        { dayOfWeek: 1, startTime: '13:00', endTime: '16:00', type: 'lecture' as const }
      ]
    },
    {
      name: 'NCLEX Preparation',
      code: 'NCLEX_335',
      professor: 'TBD',
      credits: 2,
      color: '#f59e0b',
      schedule: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', type: 'lecture' as const }
      ]
    },
    {
      name: 'OB/GYN Nursing',
      code: 'OBGYN_330',
      professor: 'TBD',
      credits: 4,
      color: '#ef4444',
      schedule: [
        { dayOfWeek: 0, startTime: '09:00', endTime: '12:00', type: 'lecture' as const },
        { dayOfWeek: 1, startTime: '07:00', endTime: '17:00', type: 'lab' as const }
      ]
    }
  ];
  
  // Add courses
  courses.forEach(course => store.addCourse(course));
  
  // Map task types from CSV to our app types
  const mapTaskType = (csvType: string): 'assignment' | 'exam' | 'project' | 'reading' | 'lab' => {
    switch(csvType.toLowerCase()) {
      case 'exam':
      case 'quiz':
        return 'exam';
      case 'assignment':
      case 'activity':
        return 'assignment';
      case 'reading':
      case 'video':
        return 'reading';
      case 'clinical':
      case 'lab':
      case 'simulation':
        return 'lab';
      case 'lecture':
      case 'review':
      case 'holiday':
      default:
        return 'assignment';
    }
  };
  
  // Parse duration to hours
  const parseDuration = (duration: string): number => {
    if (!duration || duration === 'N/A' || duration === '0') return 0;
    
    const parts = duration.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) + parseInt(parts[1])/60 + parseInt(parts[2])/3600;
    }
    return 0;
  };
  
  // Estimate complexity based on type and duration
  const estimateComplexity = (type: string, duration: number): 1 | 2 | 3 | 4 | 5 => {
    if (type === 'Exam') return 5;
    if (type === 'Clinical' || type === 'Simulation') return 4;
    if (type === 'Assignment' || type === 'Lab') return 3;
    if (type === 'Reading' || type === 'Video') return 2;
    return 1;
  };
  
  // All 408 tasks from the CSV
  const rawTasks = [
    { id: '10818', course: 'Adult_310', date: '2025-07-15', title: 'Concepts_in_Action:_Renal_Function', type: 'Activity', duration: '0:02:28' },
    { id: '10733', course: 'Adult_310', date: '2025-05-20', title: 'CoursePoint_Clotting_PrepU_Mastery_Quiz', type: 'Assignment', duration: 'N/A' },
    { id: '10734', course: 'Adult_310', date: '2025-05-20', title: 'CoursePoint_Sensory_Perception_PrepU_Mastery_Quiz', type: 'Assignment', duration: 'N/A' },
    { id: '10752', course: 'Adult_310', date: '2025-05-23', title: 'Foundations_HESI_Remediation', type: 'Assignment', duration: 'N/A' },
    { id: '10811', course: 'Adult_310', date: '2025-07-12', title: 'Clinical_Final_Reflection_Paper', type: 'Assignment', duration: 'N/A' },
    { id: '10840', course: 'Adult_310', date: '2025-07-25', title: 'Critical_Skills_Demo:_Handwashing', type: 'Assignment', duration: 'N/A' },
    { id: '10841', course: 'Adult_310', date: '2025-07-25', title: 'Critical_Skills_Demo:_Manual_Vital_Signs', type: 'Assignment', duration: 'N/A' },
    { id: '10726', course: 'Adult_310', date: '2025-05-08', title: 'Clinical_Day_1', type: 'Clinical', duration: '10:00:00' },
    { id: '10760', course: 'Adult_310', date: '2025-05-29', title: 'Clinical_Day_2', type: 'Clinical', duration: '10:00:00' },
    { id: '10767', course: 'Adult_310', date: '2025-06-05', title: 'Clinical_Day_3', type: 'Clinical', duration: '10:00:00' },
    { id: '10770', course: 'Adult_310', date: '2025-06-12', title: 'Clinical_Day_4', type: 'Clinical', duration: '10:00:00' },
    { id: '10783', course: 'Adult_310', date: '2025-06-19', title: 'Clinical_Day_5', type: 'Clinical', duration: '10:00:00' },
    { id: '10789', course: 'Adult_310', date: '2025-06-26', title: 'Clinical_Day_6', type: 'Clinical', duration: '10:00:00' },
    { id: '10801', course: 'Adult_310', date: '2025-07-02', title: 'Clinical_Day_7', type: 'Clinical', duration: '10:00:00' },
    { id: '10808', course: 'Adult_310', date: '2025-07-09', title: 'Clinical_Day_8', type: 'Clinical', duration: '10:00:00' },
    { id: '10823', course: 'Adult_310', date: '2025-07-17', title: 'Clinical_Day_6', type: 'Clinical', duration: '10:00:00' },
    { id: '10838', course: 'Adult_310', date: '2025-07-24', title: 'Clinical_Day_7', type: 'Clinical', duration: '10:00:00' },
    { id: '10749', course: 'Adult_310', date: '2025-05-21', title: 'Exam_1', type: 'Exam', duration: '3:05:00' },
    { id: '10769', course: 'Adult_310', date: '2025-06-11', title: 'Exam_2', type: 'Exam', duration: '2:00:00' },
    { id: '10810', course: 'Adult_310', date: '2025-07-11', title: 'Final_Exam', type: 'Exam', duration: '2:00:00' },
    { id: '10843', course: 'Adult_310', date: '2025-07-30', title: 'EXAM_4', type: 'Exam', duration: '2:00:00' },
    { id: '10844', course: 'Adult_310', date: '2025-08-06', title: 'FINAL_EXAM', type: 'Exam', duration: '3:00:00' },
    { id: '10731', course: 'Adult_310', date: '2025-05-15', title: 'Lab_1', type: 'Lab', duration: '4:00:00' },
    { id: '10750', course: 'Adult_310', date: '2025-05-22', title: 'Lab_2', type: 'Lab', duration: '4:00:00' },
    { id: '10719', course: 'Adult_310', date: '2025-05-07', title: 'Cardiology_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10730', course: 'Adult_310', date: '2025-05-14', title: 'Hematology_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10759', course: 'Adult_310', date: '2025-05-28', title: 'Fluids_URI_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10766', course: 'Adult_310', date: '2025-06-04', title: 'Electrolytes_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10782', course: 'Adult_310', date: '2025-06-18', title: 'Acid-Base_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10788', course: 'Adult_310', date: '2025-06-25', title: 'Endocrine_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10800', course: 'Adult_310', date: '2025-07-01', title: 'GI_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10806', course: 'Adult_310', date: '2025-07-08', title: 'Neuro_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10822', course: 'Adult_310', date: '2025-07-16', title: 'GU_Musculoskeletal_I_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10837', course: 'Adult_310', date: '2025-07-23', title: 'Musculoskeletal_II_GI_Lecture', type: 'Lecture', duration: '3:05:00' },
    { id: '10720', course: 'Adult_310', date: '2025-05-07', title: 'Dosage_Calculation_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10728', course: 'Adult_310', date: '2025-05-14', title: 'Cardiology_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10729', course: 'Adult_310', date: '2025-05-14', title: 'Hematology_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10758', course: 'Adult_310', date: '2025-05-28', title: 'Module_4_Fluids_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10765', course: 'Adult_310', date: '2025-06-04', title: 'Module_5_Electrolytes_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10781', course: 'Adult_310', date: '2025-06-18', title: 'Module_6_Acid-Base_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10787', course: 'Adult_310', date: '2025-06-25', title: 'Module_7_Endocrine_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10799', course: 'Adult_310', date: '2025-07-01', title: 'Module_8_GI_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10805', course: 'Adult_310', date: '2025-07-08', title: 'Module_9_Neuro_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10821', course: 'Adult_310', date: '2025-07-16', title: 'Module_11_Genitourinary_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10835', course: 'Adult_310', date: '2025-07-23', title: 'Module_12_Musculoskeletal_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10836', course: 'Adult_310', date: '2025-07-23', title: 'Module_12_Gastrointestinal_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10722', course: 'Adult_310', date: '2025-05-07', title: 'Chapter_21:_Assessment_of_Cardiovascular_Function', type: 'Reading', duration: 'N/A' },
    { id: '10723', course: 'Adult_310', date: '2025-05-07', title: 'Chapter_22:_Arrhythmias_and_Conduction_Problems', type: 'Reading', duration: 'N/A' },
    { id: '10724', course: 'Adult_310', date: '2025-05-07', title: 'Chapter_23:_Coronary_Vascular_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10725', course: 'Adult_310', date: '2025-05-07', title: 'Chapter_26:_Vascular_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10755', course: 'Adult_310', date: '2025-05-27', title: 'Chapter_10:_Fluid_Electrolytes', type: 'Reading', duration: 'N/A' },
    { id: '10756', course: 'Adult_310', date: '2025-05-27', title: 'Chapter_18:_Upper_Respiratory_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10763', course: 'Adult_310', date: '2025-06-03', title: 'Chapter_10:_Fluid_Electrolytes', type: 'Reading', duration: 'N/A' },
    { id: '10774', course: 'Adult_310', date: '2025-06-17', title: 'Chapter_14:_Preoperative_Nursing_Management', type: 'Reading', duration: 'N/A' },
    { id: '10775', course: 'Adult_310', date: '2025-06-17', title: 'Chapter_15:_Intraoperative_Nursing_Management', type: 'Reading', duration: 'N/A' },
    { id: '10776', course: 'Adult_310', date: '2025-06-17', title: 'Chapter_16:_Postoperative_Nursing_Management', type: 'Reading', duration: 'N/A' },
    { id: '10777', course: 'Adult_310', date: '2025-06-17', title: 'Chapter_26:_Vascular_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10778', course: 'Adult_310', date: '2025-06-17', title: 'Chapter_33:_Allergic_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10786', course: 'Adult_310', date: '2025-06-24', title: 'Chapter_33:_Allergic_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10792', course: 'Adult_310', date: '2025-06-30', title: 'Chapter_46:_Diabetes', type: 'Reading', duration: 'N/A' },
    { id: '10793', course: 'Adult_310', date: '2025-06-30', title: 'Chapter_55:_Integumentary_Function', type: 'Reading', duration: 'N/A' },
    { id: '10794', course: 'Adult_310', date: '2025-06-30', title: 'Chapter_56:_Dermatologic_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10795', course: 'Adult_310', date: '2025-06-30', title: 'Chapter_57:_Burn_Injury', type: 'Reading', duration: 'N/A' },
    { id: '10796', course: 'Adult_310', date: '2025-06-30', title: 'Chapter_67:_Emergency_Nursing', type: 'Reading', duration: 'N/A' },
    { id: '10804', course: 'Adult_310', date: '2025-07-07', title: 'Neuro_Reading', type: 'Reading', duration: 'N/A' },
    { id: '10813', course: 'Adult_310', date: '2025-07-15', title: 'Chapter_35:_Assessment_of_Musculoskeletal_Function', type: 'Reading', duration: 'N/A' },
    { id: '10814', course: 'Adult_310', date: '2025-07-15', title: 'Chapter_36:_Management_of_Patients_with_Musculoskeletal_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10815', course: 'Adult_310', date: '2025-07-15', title: 'Chapter_47:_Assessment_of_Kidney_and_Urinary_Function', type: 'Reading', duration: 'N/A' },
    { id: '10816', course: 'Adult_310', date: '2025-07-15', title: 'Chapter_49:_Management_of_Patients_with_Urinary_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10826', course: 'Adult_310', date: '2025-07-21', title: 'Chapter_37:_Management_of_Patients_with_Musculoskeletal_Trauma', type: 'Reading', duration: 'N/A' },
    { id: '10827', course: 'Adult_310', date: '2025-07-21', title: 'Chapter_38:_Assessment_of_Digestive_and_Gastrointestinal_Function', type: 'Reading', duration: 'N/A' },
    { id: '10828', course: 'Adult_310', date: '2025-07-21', title: 'Chapter_39:_Management_of_Patients_with_Oral_and_Esophageal_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10829', course: 'Adult_310', date: '2025-07-21', title: 'Chapter_40:_Management_of_Patients_with_Gastric_and_Duodenal_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10830', course: 'Adult_310', date: '2025-07-21', title: 'Chapter_41:_Management_of_Patients_with_Intestinal_and_Rectal_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10831', course: 'Adult_310', date: '2025-07-21', title: 'Chapter_44:_Management_of_Patients_with_Biliary_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10745', course: 'Adult_310', date: '2025-05-20', title: 'CoursePoint:_Angina_Interactive_Case_Study', type: 'Simulation', duration: 'N/A' },
    { id: '10803', course: 'Adult_310', date: '2025-07-03', title: 'Simulation', type: 'Simulation', duration: '8:00:00' },
    { id: '10807', course: 'Adult_310', date: '2025-07-08', title: 'vSim:_Skylar_Hansen', type: 'Simulation', duration: 'N/A' },
    { id: '10834', course: 'Adult_310', date: '2025-07-22', title: 'vSim:_Marilyn_Hughes', type: 'Simulation', duration: 'N/A' },
    { id: '10842', course: 'Adult_310', date: '2025-07-29', title: 'vSim:_Stan_Checketts', type: 'Simulation', duration: 'N/A' },
    { id: '10845', course: 'Adult_310', date: 'TBD', title: 'vSim:_Lloyd_Bennett', type: 'Simulation', duration: 'N/A' },
    { id: '10721', course: 'Adult_310', date: '2025-05-07', title: 'Cardiology_Pre-Class_Video', type: 'Video', duration: '0:07:02' },
    { id: '10727', course: 'Adult_310', date: '2025-05-08', title: 'Clinical_Video_SBAR_Week_1', type: 'Video', duration: '0:30:00' },
    { id: '10732', course: 'Adult_310', date: '2025-05-15', title: 'Clinical_Video_SBAR_Week_2', type: 'Video', duration: '0:30:00' },
    { id: '10735', course: 'Adult_310', date: '2025-05-20', title: 'CoursePoint_Concepts_in_Action:_Cardiac_Cycle_Animation', type: 'Video', duration: '0:05:00' },
    { id: '10736', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Anticoagulant_vs_Antiplatelet_vs_Thrombolytics', type: 'Video', duration: '0:05:00' },
    { id: '10737', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Antihypertensives', type: 'Video', duration: '0:05:00' },
    { id: '10738', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Aseptic_Technique', type: 'Video', duration: '0:05:00' },
    { id: '10739', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Dysrhythmia', type: 'Video', duration: '0:05:00' },
    { id: '10740', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Heparin', type: 'Video', duration: '0:05:00' },
    { id: '10741', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Loop_Diuretics', type: 'Video', duration: '0:05:00' },
    { id: '10742', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Myocardial_Infarction', type: 'Video', duration: '0:05:00' },
    { id: '10743', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Nitroglycerin', type: 'Video', duration: '0:05:00' },
    { id: '10744', course: 'Adult_310', date: '2025-05-20', title: 'One-Minute_Nurse:_Rights_of_Medication_Administration', type: 'Video', duration: '0:05:00' },
    { id: '10746', course: 'Adult_310', date: '2025-05-20', title: 'Watch_and_Learn:_Continuous_Tube_Feeding', type: 'Video', duration: '0:06:59' },
    { id: '10747', course: 'Adult_310', date: '2025-05-20', title: 'Watch_and_Learn:_Subcutaneous_Injection', type: 'Video', duration: '0:07:56' },
    { id: '10748', course: 'Adult_310', date: '2025-05-20', title: 'Watch_and_Learn:_Intramuscular_Injection', type: 'Video', duration: '0:08:57' },
    { id: '10751', course: 'Adult_310', date: '2025-05-22', title: 'Clinical_Video_SBAR_Week_3', type: 'Video', duration: '0:30:00' },
    { id: '10753', course: 'Adult_310', date: '2025-05-27', title: 'Fluids_Pre-Class_Video', type: 'Video', duration: '0:17:35' },
    { id: '10754', course: 'Adult_310', date: '2025-05-27', title: 'Upper_Respiratory_Pre-Class_Video', type: 'Video', duration: '0:16:37' },
    { id: '10757', course: 'Adult_310', date: '2025-05-27', title: 'Watch_and_Learn:_Monitoring_IV_Site_and_Infusion', type: 'Video', duration: '0:07:26' },
    { id: '10761', course: 'Adult_310', date: '2025-05-29', title: 'Clinical_Video_SBAR_Week_4', type: 'Video', duration: '0:30:00' },
    { id: '10762', course: 'Adult_310', date: '2025-06-03', title: 'Electrolytes_Pre-Class_Video', type: 'Video', duration: '0:17:50' },
    { id: '10764', course: 'Adult_310', date: '2025-06-03', title: 'Concepts_in_Action:_Edema', type: 'Video', duration: 'N/A' },
    { id: '10768', course: 'Adult_310', date: '2025-06-05', title: 'Clinical_Video_SBAR_Week_5', type: 'Video', duration: '0:30:00' },
    { id: '10771', course: 'Adult_310', date: '2025-06-12', title: 'Clinical_Video_SBAR_Week_6', type: 'Video', duration: '0:30:00' },
    { id: '10772', course: 'Adult_310', date: '2025-06-17', title: 'Operative_Pre-Class_Video', type: 'Video', duration: '0:48:48' },
    { id: '10773', course: 'Adult_310', date: '2025-06-17', title: 'Integumentary_I_Pre-Class_Video', type: 'Video', duration: '0:38:08' },
    { id: '10779', course: 'Adult_310', date: '2025-06-17', title: 'Watch_and_Learn:_Preoperative_Care', type: 'Video', duration: '0:10:34' },
    { id: '10780', course: 'Adult_310', date: '2025-06-17', title: 'Watch_and_Learn:_Postoperative_Care', type: 'Video', duration: '0:13:00' },
    { id: '10784', course: 'Adult_310', date: '2025-06-19', title: 'Clinical_Video_SBAR_Week_7', type: 'Video', duration: '0:30:00' },
    { id: '10785', course: 'Adult_310', date: '2025-06-24', title: 'Immune_Pre-Class_Video', type: 'Video', duration: 'N/A' },
    { id: '10790', course: 'Adult_310', date: '2025-06-26', title: 'Clinical_Video_SBAR_Week_8', type: 'Video', duration: '0:30:00' },
    { id: '10791', course: 'Adult_310', date: '2025-06-30', title: 'Integumentary_and_Diabetes_Pre-Class_Video', type: 'Video', duration: 'N/A' },
    { id: '10797', course: 'Adult_310', date: '2025-06-30', title: 'One_Minute_Nurse:_Diabetes_Mellitus_Insulin', type: 'Video', duration: 'N/A' },
    { id: '10798', course: 'Adult_310', date: '2025-06-30', title: 'Watch_and_Learn:_Wound_Irrigation', type: 'Video', duration: '0:14:43' },
    { id: '10802', course: 'Adult_310', date: '2025-07-02', title: 'Clinical_Video_SBAR_Week_9', type: 'Video', duration: '0:30:00' },
    { id: '10809', course: 'Adult_310', date: '2025-07-09', title: 'Clinical_Video_SBAR_Week_10', type: 'Video', duration: '0:30:00' },
    { id: '10812', course: 'Adult_310', date: '2025-07-15', title: 'Genitourinary_and_Musculoskeletal_Pre-Class_Video', type: 'Video', duration: 'N/A' },
    { id: '10817', course: 'Adult_310', date: '2025-07-15', title: 'One_Minute_Nurse:_UTI', type: 'Video', duration: '0:03:13' },
    { id: '10819', course: 'Adult_310', date: '2025-07-15', title: 'Watch_and_Learn:_Catheterizing_the_Male_Urinary_Bladder', type: 'Video', duration: '0:15:43' },
    { id: '10820', course: 'Adult_310', date: '2025-07-15', title: 'Watch_and_Learn:_Applying_a_Condom_Catheter', type: 'Video', duration: '0:06:45' },
    { id: '10824', course: 'Adult_310', date: '2025-07-17', title: 'Clinical_Video_SBAR_Week_11', type: 'Video', duration: '0:30:00' },
    { id: '10825', course: 'Adult_310', date: '2025-07-21', title: 'Musculoskeletal_and_Gastrointestinal_Pre-Class_Video', type: 'Video', duration: 'N/A' },
    { id: '10832', course: 'Adult_310', date: '2025-07-21', title: 'Watch_and_Learn:_Inserting_a_Nasogastric_Tube', type: 'Video', duration: '0:12:55' },
    { id: '10833', course: 'Adult_310', date: '2025-07-21', title: 'Watch_and_Learn:_Administering_Continuous_Tube_Feeding_Using_a_Feeding_Pump', type: 'Video', duration: '0:05:58' },
    { id: '10839', course: 'Adult_310', date: '2025-07-24', title: 'Clinical_Video_SBAR_Week_12', type: 'Video', duration: '0:30:00' },
    // Gerontology_315 tasks
    { id: '10848', course: 'Gerontology_315', date: '2025-05-05', title: 'Post-Class_Attendance_Week_1', type: 'Assignment', duration: 'N/A' },
    { id: '10867', course: 'Gerontology_315', date: '2025-05-14', title: 'Topic_3_Assignment:_Legal_Ethical_Aspects', type: 'Assignment', duration: 'N/A' },
    { id: '10874', course: 'Gerontology_315', date: '2025-05-18', title: 'CastleBranch_Quiz_closes', type: 'Assignment', duration: 'N/A' },
    { id: '10885', course: 'Gerontology_315', date: '2025-05-28', title: 'Topic_6_Assignment', type: 'Assignment', duration: 'N/A' },
    { id: '10892', course: 'Gerontology_315', date: '2025-06-02', title: 'Assessment_of_the_Older_Adult_Assignment', type: 'Assignment', duration: 'N/A' },
    { id: '10920', course: 'Gerontology_315', date: '2025-06-16', title: 'Group_Project_Submission', type: 'Assignment', duration: 'N/A' },
    { id: '10931', course: 'Gerontology_315', date: '2025-06-23', title: 'Team_Project_Submission_1', type: 'Assignment', duration: 'N/A' },
    { id: '10937', course: 'Gerontology_315', date: '2025-06-25', title: 'Topic_13:_Immunity_Infections_Chronic_Conditions_and_Cancer', type: 'Assignment', duration: 'N/A' },
    { id: '10943', course: 'Gerontology_315', date: '2025-06-29', title: 'Dementia_Assignment', type: 'Assignment', duration: 'N/A' },
    { id: '10956', course: 'Gerontology_315', date: '2025-07-02', title: 'Topic_15:_Continuum_of_Care_and_Care_Settings', type: 'Assignment', duration: 'N/A' },
    { id: '10959', course: 'Gerontology_315', date: '2025-07-06', title: 'Final_Reflection_Paper', type: 'Assignment', duration: 'N/A' },
    { id: '10964', course: 'Gerontology_315', date: '2025-07-09', title: 'Post_Class_Attendance_Week_10', type: 'Assignment', duration: 'N/A' },
    { id: '10971', course: 'Gerontology_315', date: '2025-07-14', title: 'Final_Team_Project_Presentation_Submission', type: 'Assignment', duration: 'N/A' },
    { id: '10880', course: 'Gerontology_315', date: '2025-05-21', title: 'Exam_1:_Modules_1_2', type: 'Exam', duration: '2:00:00' },
    { id: '10922', course: 'Gerontology_315', date: '2025-06-18', title: 'Exam_2:_Modules_3-5', type: 'Exam', duration: '2:00:00' },
    { id: '10974', course: 'Gerontology_315', date: '2025-07-23', title: 'EXAM_3', type: 'Exam', duration: '2:00:00' },
    { id: '10975', course: 'Gerontology_315', date: '2025-07-30', title: 'HESI_Specialty_Exam', type: 'Exam', duration: '2:00:00' },
    { id: '10846', course: 'Gerontology_315', date: '2025-05-05', title: 'Class', type: 'Lecture', duration: '3:00:00' },
    { id: '10865', course: 'Gerontology_315', date: '2025-05-12', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10881', course: 'Gerontology_315', date: '2025-05-28', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10893', course: 'Gerontology_315', date: '2025-06-04', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10903', course: 'Gerontology_315', date: '2025-06-09', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10918', course: 'Gerontology_315', date: '2025-06-16', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10921', course: 'Gerontology_315', date: '2025-06-18', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10925', course: 'Gerontology_315', date: '2025-06-23', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10932', course: 'Gerontology_315', date: '2025-06-25', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10941', course: 'Gerontology_315', date: '2025-06-29', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10955', course: 'Gerontology_315', date: '2025-07-01', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10957', course: 'Gerontology_315', date: '2025-07-06', title: 'Class', type: 'Lecture', duration: '3:00:00' },
    { id: '10963', course: 'Gerontology_315', date: '2025-07-09', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
    { id: '10972', course: 'Gerontology_315', date: '2025-07-16', title: 'PRESENTATIONS', type: 'Lecture', duration: '3:00:00' },
    { id: '10847', course: 'Gerontology_315', date: '2025-05-05', title: 'Attendance_Quiz_Week_1', type: 'Quiz', duration: 'N/A' },
    { id: '10864', course: 'Gerontology_315', date: '2025-05-12', title: 'CastleBranch_Education_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10866', course: 'Gerontology_315', date: '2025-05-12', title: 'Attendance_Quiz_Week_2', type: 'Quiz', duration: 'N/A' },
    { id: '10868', course: 'Gerontology_315', date: '2025-05-14', title: 'Quiz_1:_Modules_1-2_Respondus', type: 'Quiz', duration: 'N/A' },
    { id: '10882', course: 'Gerontology_315', date: '2025-05-28', title: 'Attendance_Quiz_Week_4', type: 'Quiz', duration: 'N/A' },
    { id: '10884', course: 'Gerontology_315', date: '2025-05-28', title: 'One-Minute_Nurse_Falls-Prevention_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10891', course: 'Gerontology_315', date: '2025-06-02', title: 'Attendance_Quiz_Week_5', type: 'Quiz', duration: 'N/A' },
    { id: '10899', course: 'Gerontology_315', date: '2025-06-04', title: 'Quiz_2:_Modules_3_4_Respondus', type: 'Quiz', duration: 'N/A' },
    { id: '10911', course: 'Gerontology_315', date: '2025-06-11', title: 'Attendance_Quiz_Week_6', type: 'Quiz', duration: 'N/A' },
    { id: '10919', course: 'Gerontology_315', date: '2025-06-16', title: 'Attendance_Quiz_Week_7', type: 'Quiz', duration: 'N/A' },
    { id: '10926', course: 'Gerontology_315', date: '2025-06-23', title: 'Attendance_Quiz_Week_8', type: 'Quiz', duration: 'N/A' },
    { id: '10927', course: 'Gerontology_315', date: '2025-06-23', title: 'Quiz_3:_Modules_5_6', type: 'Quiz', duration: 'N/A' },
    { id: '10933', course: 'Gerontology_315', date: '2025-06-25', title: 'One-Minute_Nurse:_Alzheimer_Disease_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10935', course: 'Gerontology_315', date: '2025-06-25', title: 'One-Minute_Nurse:_Delirium_vs_Dementia_Quiz', type: 'Quiz', duration: 'N/A' },
    { id: '10942', course: 'Gerontology_315', date: '2025-06-29', title: 'Attendance_Quiz_Week_9', type: 'Quiz', duration: 'N/A' },
    { id: '10958', course: 'Gerontology_315', date: '2025-07-06', title: 'Attendance_Quiz_Week_10', type: 'Quiz', duration: 'N/A' },
    { id: '10966', course: 'Gerontology_315', date: '2025-07-09', title: 'Quiz_4:_Modules_7_8', type: 'Quiz', duration: 'N/A' },
    { id: '10973', course: 'Gerontology_315', date: '2025-07-16', title: 'Attendance_Quiz_Week_11', type: 'Quiz', duration: 'N/A' },
    { id: '10854', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_1_Reading:_The_Aging_Population', type: 'Reading', duration: 'N/A' },
    { id: '10855', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_2_Reading:_Theories_of_Aging', type: 'Reading', duration: 'N/A' },
    { id: '10856', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_3_Reading:_Diversity', type: 'Reading', duration: 'N/A' },
    { id: '10857', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_4_Reading:_Life_Transitions_and_Story', type: 'Reading', duration: 'N/A' },
    { id: '10858', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_5_Reading:_Common_Aging_Changes', type: 'Reading', duration: 'N/A' },
    { id: '10859', course: 'Gerontology_315', date: '2025-05-11', title: 'Chapter_1_Reading', type: 'Reading', duration: 'N/A' },
    { id: '10860', course: 'Gerontology_315', date: '2025-05-11', title: 'Chapter_2_Reading', type: 'Reading', duration: 'N/A' },
    { id: '10861', course: 'Gerontology_315', date: '2025-05-11', title: 'Chapter_3_Reading', type: 'Reading', duration: 'N/A' },
    { id: '10862', course: 'Gerontology_315', date: '2025-05-11', title: 'Chapter_4_Reading', type: 'Reading', duration: 'N/A' },
    { id: '10863', course: 'Gerontology_315', date: '2025-05-11', title: 'Chapter_5_Reading', type: 'Reading', duration: 'N/A' },
    { id: '10875', course: 'Gerontology_315', date: '2025-05-20', title: 'Chapter_6_Reading:_The_Specialty_of_Gerontological_Nursing', type: 'Reading', duration: 'N/A' },
    { id: '10876', course: 'Gerontology_315', date: '2025-05-20', title: 'Chapter_7_Reading:_Holistic_Assessment_Care_Planning', type: 'Reading', duration: 'N/A' },
    { id: '10877', course: 'Gerontology_315', date: '2025-05-20', title: 'Chapter_8_Reading:_Legal_Aspects', type: 'Reading', duration: 'N/A' },
    { id: '10878', course: 'Gerontology_315', date: '2025-05-20', title: 'Chapter_9_Reading:_Ethical_Aspects', type: 'Reading', duration: 'N/A' },
    { id: '10879', course: 'Gerontology_315', date: '2025-05-20', title: 'Chapter_10_Reading:_Continuum_of_Care', type: 'Reading', duration: 'N/A' },
    { id: '10886', course: 'Gerontology_315', date: '2025-06-01', title: 'Chapter_11_Reading:_Nutrition_Hydration', type: 'Reading', duration: 'N/A' },
    { id: '10887', course: 'Gerontology_315', date: '2025-06-01', title: 'Chapter_12_Reading:_Sleep_Rest', type: 'Reading', duration: 'N/A' },
    { id: '10888', course: 'Gerontology_315', date: '2025-06-01', title: 'Chapter_13_Reading:_Comfort_Pain_Management', type: 'Reading', duration: 'N/A' },
    { id: '10889', course: 'Gerontology_315', date: '2025-06-01', title: 'Chapter_14_Reading:_Safety', type: 'Reading', duration: 'N/A' },
    { id: '10890', course: 'Gerontology_315', date: '2025-06-01', title: 'Chapter_15_Reading:_Safe_Medication_Use', type: 'Reading', duration: 'N/A' },
    { id: '10900', course: 'Gerontology_315', date: '2025-06-08', title: 'Chapter_16_Reading:_Respiration', type: 'Reading', duration: 'N/A' },
    { id: '10901', course: 'Gerontology_315', date: '2025-06-08', title: 'Chapter_17_Reading:_Circulation', type: 'Reading', duration: 'N/A' },
    { id: '10902', course: 'Gerontology_315', date: '2025-06-08', title: 'Chapter_18_Reading:_Digestion_Bowel_Elimination', type: 'Reading', duration: 'N/A' },
    { id: '10912', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_19_Reading:_Urinary_Elimination', type: 'Reading', duration: 'N/A' },
    { id: '10913', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_20_Reading:_Reproductive_System_Health', type: 'Reading', duration: 'N/A' },
    { id: '10914', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_21_Reading:_Mobility', type: 'Reading', duration: 'N/A' },
    { id: '10915', course: 'Gerontology_315', date: '2025-06-15', title: 'Chapter_19_Reading:_Urinary_Elimination', type: 'Reading', duration: 'N/A' },
    { id: '10916', course: 'Gerontology_315', date: '2025-06-15', title: 'Chapter_20_Reading:_Reproductive_System_Health', type: 'Reading', duration: 'N/A' },
    { id: '10917', course: 'Gerontology_315', date: '2025-06-15', title: 'Chapter_21_Reading:_Mobility', type: 'Reading', duration: 'N/A' },
    { id: '10923', course: 'Gerontology_315', date: '2025-06-22', title: 'Chapters_22_23_Readings', type: 'Reading', duration: 'N/A' },
    { id: '10924', course: 'Gerontology_315', date: '2025-06-22', title: 'Chapter_24_Reading:_Cognitive_Function', type: 'Reading', duration: 'N/A' },
    { id: '10938', course: 'Gerontology_315', date: '2025-06-27', title: 'Chapter_25_Reading:_Depression', type: 'Reading', duration: 'N/A' },
    { id: '10939', course: 'Gerontology_315', date: '2025-06-27', title: 'Chapter_26_Reading:_Delirium_and_Dementia', type: 'Reading', duration: 'N/A' },
    { id: '10940', course: 'Gerontology_315', date: '2025-06-27', title: 'Chapter_27_Reading:_Neurologic_Function', type: 'Reading', duration: 'N/A' },
    { id: '10947', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_22_Reading:_Neurologic_Function', type: 'Reading', duration: 'N/A' },
    { id: '10948', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_23_Reading:_Vision_and_Hearing', type: 'Reading', duration: 'N/A' },
    { id: '10949', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_24_Reading:_Endocrine_Function', type: 'Reading', duration: 'N/A' },
    { id: '10950', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_25_Reading:_Skin_Health', type: 'Reading', duration: 'N/A' },
    { id: '10951', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_26_Reading:_Cancer', type: 'Reading', duration: 'N/A' },
    { id: '10952', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_27_Reading:_Mental_Health_Disorders', type: 'Reading', duration: 'N/A' },
    { id: '10953', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_28_Reading:_Delirium_and_Dementia', type: 'Reading', duration: 'N/A' },
    { id: '10954', course: 'Gerontology_315', date: '2025-06-29', title: 'Chapter_29_Reading:_Living_in_Harmony_With_Chronic_Conditions', type: 'Reading', duration: 'N/A' },
    { id: '10960', course: 'Gerontology_315', date: '2025-07-06', title: 'Chapter_32_Reading:_Rehabilitative_and_Restorative_Care', type: 'Reading', duration: 'N/A' },
    { id: '10961', course: 'Gerontology_315', date: '2025-07-06', title: 'Chapter_33_Reading:_Acute_Care', type: 'Reading', duration: 'N/A' },
    { id: '10962', course: 'Gerontology_315', date: '2025-07-06', title: 'Chapter_34_Reading:_Long-Term_Care', type: 'Reading', duration: 'N/A' },
    { id: '10967', course: 'Gerontology_315', date: '2025-07-13', title: 'Chapter_30_Reading:_Spirituality', type: 'Reading', duration: 'N/A' },
    { id: '10968', course: 'Gerontology_315', date: '2025-07-13', title: 'Chapter_31_Reading:_Sexuality_and_Intimacy', type: 'Reading', duration: 'N/A' },
    { id: '10969', course: 'Gerontology_315', date: '2025-07-13', title: 'Chapter_35_Reading:_Family_Caregiving', type: 'Reading', duration: 'N/A' },
    { id: '10970', course: 'Gerontology_315', date: '2025-07-13', title: 'Chapter_36_Reading:_End-of-Life_Care', type: 'Reading', duration: 'N/A' },
    { id: '10849', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_1_Recording', type: 'Video', duration: '0:23:21' },
    { id: '10850', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_2_Recording', type: 'Video', duration: '0:21:23' },
    { id: '10851', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_3_Recording', type: 'Video', duration: '0:34:11' },
    { id: '10852', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_4_Recording', type: 'Video', duration: '0:27:47' },
    { id: '10853', course: 'Gerontology_315', date: '2025-05-07', title: 'Chapter_5_Recording', type: 'Video', duration: '0:30:19' },
    { id: '10869', course: 'Gerontology_315', date: '2025-05-14', title: 'Chapter_6_Recording', type: 'Video', duration: 'N/A' },
    { id: '10870', course: 'Gerontology_315', date: '2025-05-14', title: 'Chapter_7_Recording', type: 'Video', duration: '0:13:29' },
    { id: '10871', course: 'Gerontology_315', date: '2025-05-14', title: 'Chapter_8_Recording', type: 'Video', duration: 'N/A' },
    { id: '10872', course: 'Gerontology_315', date: '2025-05-14', title: 'Chapter_9_Recording', type: 'Video', duration: '0:11:05' },
    { id: '10873', course: 'Gerontology_315', date: '2025-05-14', title: 'Chapter_10_Recording', type: 'Video', duration: '0:10:14' },
    { id: '10883', course: 'Gerontology_315', date: '2025-05-28', title: 'One-Minute_Nurse_Falls-Prevention_Video', type: 'Video', duration: 'N/A' },
    { id: '10894', course: 'Gerontology_315', date: '2025-06-04', title: 'Chapter_11_Recording', type: 'Video', duration: '0:23:59' },
    { id: '10895', course: 'Gerontology_315', date: '2025-06-04', title: 'Chapter_12_Recording', type: 'Video', duration: '0:16:47' },
    { id: '10896', course: 'Gerontology_315', date: '2025-06-04', title: 'Chapter_13_Recording', type: 'Video', duration: '0:18:56' },
    { id: '10897', course: 'Gerontology_315', date: '2025-06-04', title: 'Chapter_14_Recording', type: 'Video', duration: '0:31:37' },
    { id: '10898', course: 'Gerontology_315', date: '2025-06-04', title: 'Chapter_15_Recording', type: 'Video', duration: '1:36:49' },
    { id: '10904', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_16_Recording', type: 'Video', duration: '0:23:59' },
    { id: '10905', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_17_Recording_Part_1', type: 'Video', duration: '0:36:31' },
    { id: '10906', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_17_Recording_Part_2', type: 'Video', duration: '0:13:56' },
    { id: '10907', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_18_Recording', type: 'Video', duration: '0:27:16' },
    { id: '10908', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_19_Recording', type: 'Video', duration: '0:41:56' },
    { id: '10909', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_20_Recording', type: 'Video', duration: '0:44:56' },
    { id: '10910', course: 'Gerontology_315', date: '2025-06-11', title: 'Chapter_21_Recording', type: 'Video', duration: '0:31:06' },
    { id: '10928', course: 'Gerontology_315', date: '2025-06-23', title: 'Recording:_Chapter_22', type: 'Video', duration: '0:33:39' },
    { id: '10929', course: 'Gerontology_315', date: '2025-06-23', title: 'Recording:_Chapter_23', type: 'Video', duration: '0:45:41' },
    { id: '10930', course: 'Gerontology_315', date: '2025-06-23', title: 'Recording:_Chapter_24', type: 'Video', duration: '0:30:08' },
    { id: '10934', course: 'Gerontology_315', date: '2025-06-25', title: 'One-Minute_Nurse:_Alzheimer_Disease_Video', type: 'Video', duration: 'N/A' },
    { id: '10936', course: 'Gerontology_315', date: '2025-06-25', title: 'One-Minute_Nurse:_Delirium_vs_Dementia_Video', type: 'Video', duration: 'N/A' },
    { id: '10944', course: 'Gerontology_315', date: '2025-06-29', title: 'Recording:_Chapter_25', type: 'Video', duration: '0:47:40' },
    { id: '10945', course: 'Gerontology_315', date: '2025-06-29', title: 'Recording:_Chapter_26', type: 'Video', duration: '0:37:20' },
    { id: '10946', course: 'Gerontology_315', date: '2025-06-29', title: 'Recording:_Chapter_27', type: 'Video', duration: '0:40:45' },
    { id: '10965', course: 'Gerontology_315', date: '2025-07-09', title: 'One-Minute_Nurse:_End-of-Life_Considerations_Video', type: 'Video', duration: 'N/A' },
   // NCLEX_335 tasks
   { id: '10571', course: 'NCLEX_335', date: '2025-05-05', title: 'Nearpod_Activity', type: 'Activity', duration: '0:15:00' },
   { id: '10572', course: 'NCLEX_335', date: '2025-05-05', title: 'Escape-Room_Prioritization', type: 'Activity', duration: '0:08:00' },
   { id: '10569', course: 'NCLEX_335', date: '2025-05-05', title: 'Attestation_Quiz', type: 'Assignment', duration: 'N/A' },
   { id: '10570', course: 'NCLEX_335', date: '2025-05-05', title: 'Mid-HESI_Registration', type: 'Assignment', duration: 'N/A' },
   { id: '10574', course: 'NCLEX_335', date: '2025-05-12', title: 'HESI_Exam_Prep', type: 'Assignment', duration: 'N/A' },
   { id: '10576', course: 'NCLEX_335', date: '2025-05-12', title: 'Coronary_Artery_Disease_Activity', type: 'Assignment', duration: 'N/A' },
   { id: '10577', course: 'NCLEX_335', date: '2025-05-12', title: 'COPD_Pneumonia_Activity', type: 'Assignment', duration: 'N/A' },
   { id: '10582', course: 'NCLEX_335', date: '2025-05-27', title: 'Health_Assessment_Remediation_-_Case_Studies', type: 'Assignment', duration: 'N/A' },
   { id: '10583', course: 'NCLEX_335', date: '2025-05-27', title: 'Health_Assessment_Remediation_-_Learning_Templates', type: 'Assignment', duration: 'N/A' },
   { id: '10586', course: 'NCLEX_335', date: '2025-06-02', title: 'HESI_Exam_Prep:_Nutrition', type: 'Assignment', duration: 'N/A' },
   { id: '10594', course: 'NCLEX_335', date: '2025-06-16', title: 'Nutrition_Remediation_-_Case_Studies', type: 'Assignment', duration: 'N/A' },
   { id: '10595', course: 'NCLEX_335', date: '2025-06-16', title: 'Nutrition_Remediation_-_Learning_Templates', type: 'Assignment', duration: 'N/A' },
   { id: '10599', course: 'NCLEX_335', date: '2025-06-23', title: 'HESI_Exam_Prep:_Fundamentals', type: 'Assignment', duration: 'N/A' },
   { id: '10605', course: 'NCLEX_335', date: '2025-07-07', title: 'Fundamentals_Remediation_-_Case_Studies', type: 'Assignment', duration: 'N/A' },
   { id: '10606', course: 'NCLEX_335', date: '2025-07-07', title: 'Fundamentals_Remediation_-_Learning_Templates', type: 'Assignment', duration: 'N/A' },
   { id: '10609', course: 'NCLEX_335', date: '2025-07-14', title: 'HESI_Exam_Prep:_Mental_Health', type: 'Assignment', duration: 'N/A' },
   { id: '10614', course: 'NCLEX_335', date: '2025-07-21', title: 'HESI_Exam_Prep:_Pathophysiology', type: 'Assignment', duration: 'N/A' },
   { id: '10618', course: 'NCLEX_335', date: '2025-07-28', title: 'Mental_Health_Remediation_-_Case_Studies', type: 'Assignment', duration: 'N/A' },
   { id: '10619', course: 'NCLEX_335', date: '2025-07-28', title: 'Mental_Health_Remediation_-_Learning_Templates', type: 'Assignment', duration: 'N/A' },
   { id: '10620', course: 'NCLEX_335', date: '2025-08-01', title: 'Simulation_Skills_Remediation', type: 'Assignment', duration: '3:37:30' },
   { id: '10621', course: 'NCLEX_335', date: '2025-08-04', title: 'Pathophysiology_Remediation_-_Case_Studies', type: 'Assignment', duration: 'N/A' },
   { id: '10622', course: 'NCLEX_335', date: '2025-08-04', title: 'Pathophysiology_Remediation_-_Learning_Templates', type: 'Assignment', duration: 'N/A' },
   { id: '10575', course: 'NCLEX_335', date: '2025-05-12', title: 'HESI_Health-Assessment_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10587', course: 'NCLEX_335', date: '2025-06-02', title: 'HESI_Nutrition_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10590', course: 'NCLEX_335', date: '2025-06-14', title: 'HESI_Pharmacology_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10596', course: 'NCLEX_335', date: '2025-06-21', title: 'HESI_Fundamentals_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10603', course: 'NCLEX_335', date: '2025-07-05', title: 'HESI_Exit_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10610', course: 'NCLEX_335', date: '2025-07-14', title: 'HESI_Mental_Health_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10615', course: 'NCLEX_335', date: '2025-07-21', title: 'HESI_Pathophysiology_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10623', course: 'NCLEX_335', date: '2025-08-07', title: 'FINAL_EXAM:_Mid-HESI', type: 'Exam', duration: '3:00:00' },
   { id: '10581', course: 'NCLEX_335', date: '2025-05-26', title: 'Memorial_Day', type: 'Holiday', duration: '0' },
   { id: '10568', course: 'NCLEX_335', date: '2025-05-05', title: 'On-campus_session', type: 'Lecture', duration: '3:00:00' },
   { id: '10573', course: 'NCLEX_335', date: '2025-05-12', title: 'On-campus_session', type: 'Lecture', duration: '2:00:00' },
   { id: '10580', course: 'NCLEX_335', date: '2025-05-19', title: 'Zoom_session_Module_3:_Nutrition_Wellness', type: 'Lecture', duration: '3:00:00' },
   { id: '10584', course: 'NCLEX_335', date: '2025-06-02', title: 'On-campus_session_Quiz_2_HESI_Nutrition_Exam', type: 'Lecture', duration: '3:00:00' },
   { id: '10589', course: 'NCLEX_335', date: '2025-06-09', title: 'Zoom_session_Foundations_module', type: 'Lecture', duration: '3:00:00' },
   { id: '10591', course: 'NCLEX_335', date: '2025-06-16', title: 'ON-CAMPUS_session_High-Fidelity_Simulation', type: 'Lecture', duration: '3:37:30' },
   { id: '10597', course: 'NCLEX_335', date: '2025-06-23', title: 'ON-CAMPUS_session', type: 'Lecture', duration: '3:00:00' },
   { id: '10602', course: 'NCLEX_335', date: '2025-06-30', title: 'ZOOM_session_Module_5:_Pharmacology', type: 'Lecture', duration: '3:00:00' },
   { id: '10604', course: 'NCLEX_335', date: '2025-07-07', title: 'ZOOM_session_Module_6:_Mental_Health', type: 'Lecture', duration: '3:00:00' },
   { id: '10607', course: 'NCLEX_335', date: '2025-07-14', title: 'ON-CAMPUS_session', type: 'Lecture', duration: '3:00:00' },
   { id: '10612', course: 'NCLEX_335', date: '2025-07-21', title: 'ON-CAMPUS_session', type: 'Lecture', duration: '3:00:00' },
   { id: '10617', course: 'NCLEX_335', date: '2025-07-28', title: 'ZOOM_session_Mid-HESI_Review', type: 'Lecture', duration: '3:00:00' },
   { id: '10578', course: 'NCLEX_335', date: '2025-05-12', title: 'Reflection_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10579', course: 'NCLEX_335', date: '2025-05-14', title: 'Quiz_1:_Health_Assessment_Foundations', type: 'Quiz', duration: 'N/A' },
   { id: '10585', course: 'NCLEX_335', date: '2025-06-02', title: 'Quiz_2:_Health_Promotion_Pharmacology', type: 'Quiz', duration: 'N/A' },
   { id: '10588', course: 'NCLEX_335', date: '2025-06-02', title: 'Reflection_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10592', course: 'NCLEX_335', date: '2025-06-16', title: 'Pre-simulation_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10593', course: 'NCLEX_335', date: '2025-06-16', title: 'Post-simulation_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10598', course: 'NCLEX_335', date: '2025-06-23', title: 'Quiz_3:_Assessment_Foundations_Pathophysiology', type: 'Quiz', duration: 'N/A' },
   { id: '10600', course: 'NCLEX_335', date: '2025-06-23', title: 'Reflection_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10608', course: 'NCLEX_335', date: '2025-07-14', title: 'Quiz_4:_Mental_Health_Concepts', type: 'Quiz', duration: 'N/A' },
   { id: '10611', course: 'NCLEX_335', date: '2025-07-14', title: 'Reflection_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10613', course: 'NCLEX_335', date: '2025-07-21', title: 'Quiz_5:_Maternal_Child_Nursing', type: 'Quiz', duration: 'N/A' },
   { id: '10616', course: 'NCLEX_335', date: '2025-07-21', title: 'Reflection_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10624', course: 'NCLEX_335', date: '2025-08-07', title: 'Quiz_6:_Adult_Health_I_Concepts', type: 'Quiz', duration: 'N/A' },
   { id: '10601', course: 'NCLEX_335', date: '2025-06-28', title: 'NCLEX_Prep_Module_Review', type: 'Review', duration: '2:00:00' },
   // OBGYN_330 tasks
   { id: '10658', course: 'OBGYN_330', date: '2025-05-23', title: 'Mental-Health_HESI_Remediation', type: 'Assignment', duration: 'N/A' },
   { id: '10685', course: 'OBGYN_330', date: '2025-06-15', title: 'Module_5_Key_Terms', type: 'Assignment', duration: 'N/A' },
   { id: '10713', course: 'OBGYN_330', date: '2025-07-27', title: 'Assignment:_Postpartum_Hemorrhage', type: 'Assignment', duration: 'N/A' },
   { id: '10714', course: 'OBGYN_330', date: '2025-07-27', title: 'Simulation_Ticket_to_Enter_Pre-work', type: 'Assignment', duration: 'N/A' },
   { id: '10718', course: 'OBGYN_330', date: '2025-08-04', title: 'HESI_Remediation_Assignment', type: 'Assignment', duration: 'N/A' },
   { id: '10626', course: 'OBGYN_330', date: '2025-05-06', title: 'Clinical_Orientation', type: 'Clinical', duration: '10:00:00' },
   { id: '10649', course: 'OBGYN_330', date: '2025-05-13', title: 'Clinical', type: 'Clinical', duration: '10:00:00' },
   { id: '10657', course: 'OBGYN_330', date: '2025-05-20', title: 'Clinical', type: 'Clinical', duration: '10:00:00' },
   { id: '10673', course: 'OBGYN_330', date: '2025-06-03', title: 'Clinical', type: 'Clinical', duration: '10:00:00' },
   { id: '10677', course: 'OBGYN_330', date: '2025-06-10', title: 'Clinical', type: 'Clinical', duration: '10:00:00' },
   { id: '10690', course: 'OBGYN_330', date: '2025-06-17', title: 'Clinical_Day_1', type: 'Clinical', duration: '10:00:00' },
   { id: '10697', course: 'OBGYN_330', date: '2025-06-24', title: 'Clinical_Day_2', type: 'Clinical', duration: '10:00:00' },
   { id: '10699', course: 'OBGYN_330', date: '2025-07-01', title: 'Clinical_Day_3', type: 'Clinical', duration: '10:00:00' },
   { id: '10704', course: 'OBGYN_330', date: '2025-07-08', title: 'Clinical_Day_4', type: 'Clinical', duration: '10:00:00' },
   { id: '10711', course: 'OBGYN_330', date: '2025-07-15', title: 'Clinical_Day_5', type: 'Clinical', duration: '10:00:00' },
   { id: '10656', course: 'OBGYN_330', date: '2025-05-19', title: 'Exam_1', type: 'Exam', duration: '2:00:00' },
   { id: '10676', course: 'OBGYN_330', date: '2025-06-09', title: 'Exam_2', type: 'Exam', duration: '2:00:00' },
   { id: '10698', course: 'OBGYN_330', date: '2025-06-28', title: 'Exam_3', type: 'Exam', duration: '2:00:00' },
   { id: '10705', course: 'OBGYN_330', date: '2025-07-10', title: 'Final_Exam', type: 'Exam', duration: '2:00:00' },
   { id: '10712', course: 'OBGYN_330', date: '2025-07-21', title: 'EXAM_4', type: 'Exam', duration: '2:00:00' },
   { id: '10715', course: 'OBGYN_330', date: '2025-07-28', title: 'HESI_Standardized_Exam', type: 'Exam', duration: '2:30:00' },
   { id: '10717', course: 'OBGYN_330', date: '2025-08-04', title: 'FINAL_EXAM', type: 'Exam', duration: '2:00:00' },
   { id: '10625', course: 'OBGYN_330', date: '2025-05-05', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10648', course: 'OBGYN_330', date: '2025-05-12', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10672', course: 'OBGYN_330', date: '2025-06-02', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10689', course: 'OBGYN_330', date: '2025-06-16', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10696', course: 'OBGYN_330', date: '2025-06-23', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10700', course: 'OBGYN_330', date: '2025-07-06', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10710', course: 'OBGYN_330', date: '2025-07-14', title: 'Lecture', type: 'Lecture', duration: '3:00:00' },
   { id: '10647', course: 'OBGYN_330', date: '2025-05-11', title: 'Module_1_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10654', course: 'OBGYN_330', date: '2025-05-18', title: 'Module_2_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10674', course: 'OBGYN_330', date: '2025-06-08', title: 'Module_3_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10675', course: 'OBGYN_330', date: '2025-06-08', title: 'Module_4_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10681', course: 'OBGYN_330', date: '2025-06-14', title: 'Module_5_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10682', course: 'OBGYN_330', date: '2025-06-14', title: 'Module_6_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10694', course: 'OBGYN_330', date: '2025-06-22', title: 'Module_7_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10695', course: 'OBGYN_330', date: '2025-06-22', title: 'Module_8_Adaptive_Quiz', type: 'Quiz', duration: 'N/A' },
   { id: '10627', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_1:_Clinical_Judgment_and_the_Nursing_Process', type: 'Reading', duration: 'N/A' },
   { id: '10628', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_2:_Social_Cultural_and_Ethical_Issues', type: 'Reading', duration: 'N/A' },
   { id: '10629', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_3:_Reproductive_Anatomy_and_Physiology', type: 'Reading', duration: 'N/A' },
   { id: '10630', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_4:_Hereditary_and_Environmental_Influences_on_Childbearing', type: 'Reading', duration: 'N/A' },
   { id: '10631', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_5:_Conception_and_Prenatal_Development', type: 'Reading', duration: 'N/A' },
   { id: '10632', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_6:_Adaptations_to_Pregnancy', type: 'Reading', duration: 'N/A' },
   { id: '10633', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_7:_Antepartum_Assessment_Care_and_Education', type: 'Reading', duration: 'N/A' },
   { id: '10634', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_8:_Nutrition_for_Childbearing', type: 'Reading', duration: 'N/A' },
   { id: '10635', course: 'OBGYN_330', date: '2025-05-11', title: 'Chapter_9:_Prenatal_Diagnosis_and_Fetal_Assessment', type: 'Reading', duration: 'N/A' },
   { id: '10650', course: 'OBGYN_330', date: '2025-05-18', title: 'Chapter_12:_Processes_of_Birth', type: 'Reading', duration: 'N/A' },
   { id: '10651', course: 'OBGYN_330', date: '2025-05-18', title: 'Chapter_13:_Pain_Management_During_Childbirth', type: 'Reading', duration: 'N/A' },
   { id: '10652', course: 'OBGYN_330', date: '2025-05-18', title: 'Chapter_14:_Intrapartum_Fetal_Surveillance', type: 'Reading', duration: 'N/A' },
   { id: '10653', course: 'OBGYN_330', date: '2025-05-18', title: 'Chapter_15:_Nursing_Care_During_Labor_and_Birth', type: 'Reading', duration: 'N/A' },
   { id: '10659', course: 'OBGYN_330', date: '2025-05-27', title: 'Chapter_17:_Postpartum_Adaptations_and_Nursing_Care', type: 'Reading', duration: 'N/A' },
   { id: '10660', course: 'OBGYN_330', date: '2025-05-27', title: 'Chapter_23:_Infant_Feeding', type: 'Reading', duration: 'N/A' },
   { id: '10661', course: 'OBGYN_330', date: '2025-05-27', title: 'Chapter_26:_Family_Planning', type: 'Reading', duration: 'N/A' },
   { id: '10666', course: 'OBGYN_330', date: '2025-06-01', title: 'Chapter_20:_Newborn:_Processes_of_Adaptation', type: 'Reading', duration: 'N/A' },
   { id: '10668', course: 'OBGYN_330', date: '2025-06-01', title: 'Chapter_21:_Assessment_of_the_Newborn', type: 'Reading', duration: 'N/A' },
   { id: '10670', course: 'OBGYN_330', date: '2025-06-01', title: 'Chapter_22:_Care_of_the_Newborn', type: 'Reading', duration: 'N/A' },
   { id: '10683', course: 'OBGYN_330', date: '2025-06-15', title: 'Chapter_10:_Complications_of_Pregnancy', type: 'Reading', duration: 'N/A' },
   { id: '10684', course: 'OBGYN_330', date: '2025-06-15', title: 'Chapter_11:_The_Childbearing_Family_with_Special_Needs', type: 'Reading', duration: 'N/A' },
   { id: '10691', course: 'OBGYN_330', date: '2025-06-22', title: 'Chapter_16:_Intrapartum_Complications', type: 'Reading', duration: 'N/A' },
   { id: '10692', course: 'OBGYN_330', date: '2025-06-22', title: 'Chapter_19:_Critical_Care_Obstetrics', type: 'Reading', duration: 'N/A' },
   { id: '10701', course: 'OBGYN_330', date: '2025-07-06', title: 'Chapter_18:_Postpartum_Complications', type: 'Reading', duration: 'N/A' },
   { id: '10706', course: 'OBGYN_330', date: '2025-07-13', title: 'Chapter_24:_High-Risk_Newborn:_Complications_Associated_with_Gestational_Age_and_Development', type: 'Reading', duration: 'N/A' },
   { id: '10707', course: 'OBGYN_330', date: '2025-07-13', title: 'Chapter_25:_High-Risk_Newborn:_Acquired_and_Congenital_Conditions', type: 'Reading', duration: 'N/A' },
   { id: '10655', course: 'OBGYN_330', date: '2025-05-18', title: 'Fetal_Monitoring_Simulation', type: 'Simulation', duration: '3:37:30' },
   { id: '10716', course: 'OBGYN_330', date: '2025-07-31', title: 'OB_Simulation', type: 'Simulation', duration: '3:37:30' },
   { id: '10636', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Hereditary_Environmental_Influences_on_Childbearing', type: 'Video', duration: '0:06:00' },
   { id: '10637', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Nursing_Care_During_Pregnancy_-_Psychosocial_Changes', type: 'Video', duration: '0:06:00' },
   { id: '10638', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Anatomy_Physiology_of_Pregnancy', type: 'Video', duration: '0:07:00' },
   { id: '10639', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Nursing_Care_During_Pregnancy', type: 'Video', duration: '0:09:00' },
   { id: '10640', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Nutritional_Health_During_Pregnancy', type: 'Video', duration: '0:05:00' },
   { id: '10641', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Prenatal_Screening_Diagnosis', type: 'Video', duration: '0:04:00' },
   { id: '10642', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Labor_Birth_Processes', type: 'Video', duration: '0:08:00' },
   { id: '10643', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Fetal_Assessment_During_Labor', type: 'Video', duration: '0:07:00' },
   { id: '10644', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Maximizing_Comfort-Nursing_Care', type: 'Video', duration: '0:09:00' },
   { id: '10645', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Maximizing_Comfort_-_Pharmacologic_Management', type: 'Video', duration: '0:09:00' },
   { id: '10646', course: 'OBGYN_330', date: '2025-05-11', title: 'Osmosis:_Nursing_Care_During_After_Childbirth', type: 'Video', duration: '0:04:00' },
   { id: '10662', course: 'OBGYN_330', date: '2025-05-27', title: 'Osmosis:_Postpartum_Physiologic_Changes_and_Nursing_Care', type: 'Video', duration: '0:07:00' },
   { id: '10663', course: 'OBGYN_330', date: '2025-05-27', title: 'Osmosis:_Nursing_Care_of_the_Newborn_and_Family', type: 'Video', duration: '0:09:00' },
   { id: '10664', course: 'OBGYN_330', date: '2025-05-27', title: 'Osmosis:_Infant_Feeding', type: 'Video', duration: '0:06:00' },
   { id: '10665', course: 'OBGYN_330', date: '2025-05-27', title: 'Osmosis:_Methods_of_Contraception', type: 'Video', duration: '0:07:00' },
   { id: '10667', course: 'OBGYN_330', date: '2025-06-01', title: 'Osmosis:_Physiologic_Behavioral_Adaptations_of_the_Newborn', type: 'Video', duration: '0:08:00' },
   { id: '10669', course: 'OBGYN_330', date: '2025-06-01', title: 'Osmosis:_Assessment_of_the_Newborn', type: 'Video', duration: '0:06:00' },
   { id: '10671', course: 'OBGYN_330', date: '2025-06-01', title: 'Osmosis:_Early_Care_of_the_Newborn', type: 'Video', duration: '0:06:00' },
   { id: '10678', course: 'OBGYN_330', date: '2025-06-14', title: 'Module_5_Pregnancy_at_Risk_Part_One', type: 'Video', duration: '1:49:00' },
   { id: '10679', course: 'OBGYN_330', date: '2025-06-14', title: 'Module_5_Pregnancy_at_Risk_Part_Two', type: 'Video', duration: '0:57:00' },
   { id: '10680', course: 'OBGYN_330', date: '2025-06-14', title: 'Module_5_Pregnancy_at_Risk_Part_Three', type: 'Video', duration: '1:31:00' },
   { id: '10686', course: 'OBGYN_330', date: '2025-06-15', title: 'Osmosis:_Medical-Surgical_Disorders_Impacting_Pregnancy', type: 'Video', duration: '0:10:00' },
   { id: '10687', course: 'OBGYN_330', date: '2025-06-15', title: 'Osmosis:_Hemorrhagic_Conditions_of_Early_and_Late_Pregnancy', type: 'Video', duration: '0:05:00' },
   { id: '10688', course: 'OBGYN_330', date: '2025-06-15', title: 'Osmosis:_Hypertensive_Disorders_of_Pregnancy_and_Nursing_Considerations', type: 'Video', duration: '0:07:00' },
   { id: '10693', course: 'OBGYN_330', date: '2025-06-22', title: 'Osmosis:_Intrapartum_Complications', type: 'Video', duration: '0:05:00' },
   { id: '10702', course: 'OBGYN_330', date: '2025-07-06', title: 'Osmosis:_Perinatal_and_Postpartum_Mood_and_Anxiety_Disorders', type: 'Video', duration: '0:07:00' },
   { id: '10703', course: 'OBGYN_330', date: '2025-07-06', title: 'Osmosis:_Postpartum_Complications', type: 'Video', duration: '0:08:00' },
   { id: '10708', course: 'OBGYN_330', date: '2025-07-13', title: 'Osmosis:_High-Risk_Newborn:_Complications_Associated_with_Gestational_Age_and_Development', type: 'Video', duration: '0:08:00' },
   { id: '10709', course: 'OBGYN_330', date: '2025-07-13', title: 'Osmosis:_High-Risk_Newborn:_Acquired_and_Congenital_Conditions', type: 'Video', duration: '0:08:00' }
 ];
 
 // Convert raw tasks to app format
 rawTasks.forEach(rawTask => {
   // Skip TBD dates
   if (rawTask.date === 'TBD') return;
   
   // Find the course
   const course = courses.find(c => c.code === rawTask.course);
   if (!course) return;
   
   // Parse the date
   const dueDate = new Date(rawTask.date + 'T23:59:00');
   
   // Get duration in hours
   const duration = parseDuration(rawTask.duration);
   
   // Map type and calculate complexity
   const taskType = mapTaskType(rawTask.type);
   const complexity = estimateComplexity(rawTask.type, duration);
   
   // Create the task
   const task = {
     title: rawTask.title.replace(/_/g, ' '),
     type: taskType,
     courseId: course.id,
     dueDate,
     complexity,
     estimatedHours: duration || 0, // Will be calculated if 0
     isHardDeadline: rawTask.type === 'Exam' || rawTask.type === 'Clinical',
     bufferPercentage: rawTask.type === 'Exam' ? 10 : 20,
     status: 'not-started' as const,
     description: `Type: ${rawTask.type}${duration ? `, Duration: ${rawTask.duration}` : ''}`
   };
   
   store.addTask(task);
 });
 
 console.log(`Loaded ${store.tasks.length} tasks from nursing schedule`);
};

// Export a function to clear and reload
export const clearAndReloadNursingData = () => {
 localStorage.clear();
 location.reload();
};
EOF

# Update main.tsx to use the nursing sample data
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { initializeNursingSampleData } from './utils/nursingSampleData'

// Initialize nursing sample data on first load
const isFirstLoad = !localStorage.getItem('studentlife_initialized');
if (isFirstLoad) {
 initializeNursingSampleData();
 localStorage.setItem('studentlife_initialized', 'true');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
   <App />
 </React.StrictMode>,
)
EOF
