import { useParams } from 'react-router-dom';
import { ReportsPage } from './ReportsPage.jsx';

export function DoctorPatientReportsPage() {
  const { patientId } = useParams();
  return <ReportsPage patientId={patientId} />;
}

