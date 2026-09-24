/** Home-page content. Facts only — edit here, not in the templates. */

/** First item is the lead (accented). */
export const highlights = [
  { k: 'Global leaderboard', v: 'Shell Autonomous Programming Competition — first team from Sub-Saharan Africa to compete' },
  { k: 'Specialization', v: 'Self-Driving Cars Specialization — University of Toronto' },
  { k: 'Winner', v: 'Wema Hackaholics 6.0' },
  { k: 'Led', v: 'Robotics & Automation Division, RAIN-INN ABU' },
];

export const facts = [
  { k: 'Previously', v: 'Lead, Robotics & Automation — RAIN-INN ABU' },
  { k: 'Education', v: 'B.Eng Mechatronics, ABU · GPA 4.17/5.00' },
  { k: 'Focus', v: 'Computer Vision · Robotics · Edge AI' },
  { k: 'Location', v: 'Abuja, Nigeria' },
];

export interface Project {
  title: string;
  badge: string;
  /** Short result line shown under the title, only when there is a real result. */
  result?: string;
  summary: string;
  stack: string[];
  winner?: boolean;
  /** Optional outbound links (repo, demo, write-up). Only add real URLs. */
  links?: { label: string; href: string }[];
}

export const projects: Project[] = [
  {
    title: 'Shell Autonomous Programming Competition',
    badge: 'Competition',
    result: 'First team from Sub-Saharan Africa to compete · global leaderboard placement',
    summary:
      'Spearheaded the control algorithm for autonomous navigation and obstacle avoidance.',
    stack: ['ROS', 'Robotics', 'Control'],
  },
  {
    title: 'AI-Based Smart Surveillance',
    badge: 'Final Year Project',
    summary:
      'Event-driven surveillance: a PIR sensor wakes a Raspberry Pi camera, YOLO runs object detection through the OpenCV DNN module with low-latency edge inference, and threats trigger real-time email alerts.',
    stack: ['YOLO', 'OpenCV DNN', 'Raspberry Pi', 'Edge AI'],
  },
  {
    title: 'Zindi Traffic Congestion Analytics',
    badge: 'Competition',
    summary:
      'End-to-end video-analytics pipeline that classifies urban traffic congestion — YOLOv8 for real-time tracking, LightGBM for classification, with temporal lag/delta features to capture traffic momentum.',
    stack: ['YOLOv8', 'OpenCV', 'LightGBM', 'Time-Series'],
  },
  {
    title: 'Zindi Crop Disease Detection',
    badge: 'Competition',
    summary:
      'YOLO-based crop-disease identification: multi-stage segmentation and classification behind a robust preprocessing pipeline, optimized for offline edge detection on the farm.',
    stack: ['YOLO', 'OpenCV', 'Edge Deployment'],
  },
  {
    title: 'Wema Hackaholics 6.0',
    badge: 'Winner',
    winner: true,
    result: 'Overall winners',
    summary:
      'Solved the “borderless office” problem with a dual-chatbot system for secure employee access: a WhatsApp-integrated assistant plus an identity-verification chatbot.',
    stack: ['AI Chatbots', 'WhatsApp', 'Auth'],
  },
  {
    title: 'Meta AI “SharpShop” Visual Commerce',
    badge: 'Project',
    summary:
      'Visual-first product discovery engine: vision-language models (Llama Vision) extract features from product images, with OpenCV normalization and a LangGraph + FastAPI backend.',
    stack: ['Llama Vision', 'LangGraph', 'FastAPI', 'OpenCV'],
  },
  {
    title: 'Graduate Career Agent',
    badge: 'Project',
    summary:
      'AI career coach on FastAPI + Meta Llama 3: context-aware chat, a CV-tailoring engine that parses PDFs for gap analysis, ATS score estimation, and skill categorization — containerized with Docker.',
    stack: ['Llama 3', 'FastAPI', 'Docker', 'Hugging Face'],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: 'Robotics & Hardware', items: ['ROS', 'Embedded Systems', 'Sensor Integration', 'PLC / Automation', 'Control'] },
  { group: 'Computer Vision', items: ['YOLO v5/v8', 'OpenCV', 'Object Tracking', 'Segmentation', 'Video Analytics'] },
  { group: 'Machine Learning & AI', items: ['PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'LightGBM', 'LangChain', 'LangGraph', 'Llama 3 / Vision'] },
  { group: 'Backend & Deployment', items: ['FastAPI', 'REST APIs', 'Docker', 'Edge / Raspberry Pi', 'Async Processing'] },
  { group: 'Languages', items: ['Python', 'C++', 'SQL'] },
  { group: 'Tools', items: ['Git', 'Linux', 'VS Code', 'Jupyter', 'NumPy / Pandas', 'Matplotlib'] },
];

export interface CertDoc {
  src: string;
  title: string;
  date: string;
  url: string;
}

export interface Credential {
  id: string;
  name: string;
  issuer: string;
  desc: string;
  skills: string[];
  /** Shown as the full-width card with thumbnail + course table. */
  featured?: boolean;
  /** Specialization certificate + per-course certificates (viewer cycles within this group). */
  specialization?: CertDoc & { courses: string };
  courses?: CertDoc[];
}

export const credentials: Credential[] = [
  {
    id: 'sdc',
    name: 'Self-Driving Cars Specialization',
    issuer: 'University of Toronto / Coursera',
    featured: true,
    desc: '4-course specialization covering the full autonomous-vehicle software stack — vehicle dynamics and control, state estimation and localization, visual perception, and motion planning — built through hands-on projects in the CARLA simulator.',
    skills: [
      'Vehicle dynamics & control',
      'State estimation & localization (EKF, ES-EKF, sensor fusion)',
      'Visual perception & object detection',
      'Behaviour & motion planning in CARLA',
    ],
    specialization: {
      src: '/assets/img/certs/cert-sdc-specialization.jpg',
      title: 'Self-Driving Cars — Full Specialization',
      date: 'Aug 28, 2026',
      courses: '4 Courses',
      url: 'https://coursera.org/verify/specialization/WK0A3D2QTR04',
    },
    courses: [
      { src: '/assets/img/certs/cert-sdc-intro.jpg', title: 'Introduction to Self-Driving Cars', date: 'Jun 29, 2026', url: 'https://coursera.org/verify/UMIL90E3VF7V' },
      { src: '/assets/img/certs/cert-sdc-state-estimation.jpg', title: 'State Estimation and Localization for Self-Driving Cars', date: 'Jul 18, 2026', url: 'https://coursera.org/verify/5CV6H7M8UDJC' },
      { src: '/assets/img/certs/cert-sdc-visual-perception.jpg', title: 'Visual Perception for Self-Driving Cars', date: 'Jul 24, 2026', url: 'https://coursera.org/verify/UYGH7GSJ0QEI' },
      { src: '/assets/img/certs/cert-sdc-motion-planning.jpg', title: 'Motion Planning for Self-Driving Cars', date: 'Aug 28, 2026', url: 'https://coursera.org/verify/6RNCUJTK9SRZ' },
    ],
  },
  {
    id: 'py',
    name: 'Python for Everybody Specialization',
    issuer: 'University of Michigan / Coursera',
    desc: '5-course specialization spanning Python fundamentals, data structures, networked data access, databases with SQL, and data visualization — the foundation for all subsequent ML and systems work.',
    skills: [
      'Python data structures & algorithms',
      'REST APIs & web data',
      'SQL & relational databases',
      'Data visualization',
    ],
    specialization: {
      src: '/assets/img/certs/cert-py-specialization.jpg',
      title: 'Python for Everybody — Full Specialization',
      date: 'Sep 19, 2022',
      courses: '5 Courses',
      url: 'https://coursera.org/verify/specialization/UP9QNQMNDHND',
    },
    courses: [
      { src: '/assets/img/certs/cert-py-getting-started.jpg', title: 'Programming for Everybody', date: 'Jul 28, 2022', url: 'https://coursera.org/verify/6ZS9BVZW7LMP' },
      { src: '/assets/img/certs/cert-py-data-structures.jpg', title: 'Python Data Structures', date: 'Aug 30, 2022', url: 'https://coursera.org/verify/29E8FEWH4MZZ' },
      { src: '/assets/img/certs/cert-py-web-data.jpg', title: 'Using Python to Access Web Data', date: 'Sep 7, 2022', url: 'https://coursera.org/verify/25LX99VT9JGD' },
      { src: '/assets/img/certs/cert-py-databases.jpg', title: 'Using Databases with Python', date: 'Sep 19, 2022', url: 'https://coursera.org/verify/BM7WLXL25PMM' },
      { src: '/assets/img/certs/cert-py-capstone.jpg', title: 'Capstone: Visualizing Data with Python', date: 'Sep 19, 2022', url: 'https://coursera.org/verify/9ZBLFCCT6Q3X' },
    ],
  },
  {
    id: 'ibm',
    name: 'IBM AI Engineering Professional Certificate',
    issuer: 'IBM / Coursera',
    desc: '6-course specialization covering supervised & unsupervised learning, deep neural networks with Keras, PyTorch & TensorFlow, computer vision pipelines, and deploying ML models at scale.',
    skills: [
      'Deep Learning with PyTorch & Keras',
      'Computer Vision & CNNs',
      'Model deployment & MLOps fundamentals',
      'Scalable ML pipelines',
    ],
  },
  {
    id: 'ros',
    name: 'ROS for Beginners & ROS2 Fundamentals',
    issuer: 'The Construct',
    desc: 'Hands-on training in the Robot Operating System: nodes, topics, services, actions, launch files, and integration with sensors and actuators in Gazebo simulation environments.',
    skills: [
      'ROS / ROS2 node architecture',
      'Sensor & actuator integration',
      'Gazebo simulation',
      'Launch files & package management',
    ],
  },
];
