const SAMPLE_CANDIDATES = [
  {
    id: 'candidate-sarah-jenkins',
    name: 'Sarah Jenkins',
    phone: '+27 82 345 6789',
    phoneE164: '+27823456789',
    yearsOfExperience: 5,
    seniority: 'Senior',
    location: 'Cape Town',
    workSetup: 'Remote',
    visaRequired: false,
    salaryFloorUsd: 65000,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
    rawMessage: `Hey! I'm Sarah Jenkins from Cape Town. I'm a Senior React/Node developer with 5 years of experience.
Currently doing full remote work. My stack: React, TypeScript, Node.js, PostgreSQL, Docker, AWS and GraphQL.
Looking for at least $65k minimum. Can relocate? Prefer remote but open to hybrid.`,
  },
  {
    id: 'candidate-thabo-mokoena',
    name: 'Thabo Mokoena',
    phone: '+27 71 556 8899',
    phoneE164: '+27715568899',
    yearsOfExperience: 4,
    seniority: 'Mid',
    location: 'Johannesburg',
    workSetup: 'Hybrid',
    visaRequired: false,
    salaryFloorUsd: 50000,
    skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Redis', 'Celery', 'Docker'],
    rawMessage: `Sawubona! Thabo Mokoena here, backend engineer based in Johannesburg. 4 years experience building with
Python, Django, PostgreSQL, REST APIs, Redis, Celery and Docker. Looking for hybrid setup in Joburg.
Minimum salary around $50k. No visa needed.`,
  },
  {
    id: 'candidate-elena-rostova',
    name: 'Elena Rostova',
    phone: '+27 74 112 3300',
    phoneE164: '+27741123300',
    yearsOfExperience: 3,
    seniority: 'Mid',
    location: 'Remote ZA',
    workSetup: 'Remote',
    visaRequired: false,
    salaryFloorUsd: 60000,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'MLOps', 'AWS', 'SQL'],
    rawMessage: `Hi, Elena Rostova. AI & ML Engineer, fully remote from South Africa. 3 years experience in machine
learning: Python, TensorFlow, PyTorch, scikit-learn, MLOps pipelines on AWS. Seeking $60k minimum salary,
remote only, ZA citizen no visa required.`,
  },
  {
    id: 'candidate-marcus-vance',
    name: 'Marcus Vance',
    phone: '+27 63 778 9911',
    phoneE164: '+27637789911',
    yearsOfExperience: 7,
    seniority: 'Lead',
    location: 'Durban',
    workSetup: 'Remote',
    visaRequired: false,
    salaryFloorUsd: 85000,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Go', 'Prometheus'],
    rawMessage: `Howzit, Marcus Vance. Lead DevOps Architect from Durban, 7 years experience. Deep expertise in
Kubernetes, Terraform, AWS, CI/CD pipelines, Linux, Go and Prometheus monitoring. Remote only, R850k+
(~$85k) minimum. Great with high-availability systems.`,
  },
];

export default SAMPLE_CANDIDATES;
