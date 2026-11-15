import { useMemo } from 'react';

import { useAppData } from '@/contexts/AppDataContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { usePlan } from '@/contexts/PlanContext';
import type { DashboardPendingItem, EmployeeClosingSummary, Movement } from '@/data/types';
import {
  computeActiveClosingSummaries,
  countOvertimeEmployees,
  formatMinutesAsHours,
  sumMovementsByType,
} from '@/utils/calculations';
import { competenceToLabel } from '@/utils/competence';

export type DashboardCompetenceView = {
  competenceLabel: string;
  summaries: EmployeeClosingSummary[];
  totalForecast: number;
  competenceMovements: Movement[];
  overtimeHours: string;
  overtimeEmployeeCount: number;
  pendingItems: DashboardPendingItem[];
  pendingTitle: string;
  pendingEmptyMessage: string;
  pendingShortcut: string;
  showPendingShortcut: boolean;
  pendingDetailsPath: string;
};

function pendingItemsForCompetence(
  competence: string,
  competenceLabel: string,
  summaries: EmployeeClosingSummary[],
  competenceMovements: Movement[],
  isPro: boolean,
  usesStoredReview: boolean,
): DashboardPendingItem[] {
  if (isPro && usesStoredReview) {
    return summaries
      .filter((item) => item.reviewStatus !== 'Revisado')
      .map((item) => ({
        id: `review-${competence}-${item.employeeId}`,
        type: 'Revisão de fechamento',
        employeeName: item.employeeName,
        description: `${item.role} · status ${item.reviewStatus.toLowerCase()}`,
        dateLabel: competenceLabel,
        actionLabel: 'Revisar fechamento',
        actionPath: '/closings?filter=pending',
      }));
  }

  const recordsByEmployee = new Map<string, { name: string; count: number }>();
  competenceMovements.forEach((movement) => {
    const current = recordsByEmployee.get(movement.employeeId) ?? {
      name: movement.employeeName,
      count: 0,
    };
    current.count += 1;
    recordsByEmployee.set(movement.employeeId, current);
  });

  return [...recordsByEmployee.entries()].map(([employeeId, item]) => ({
    id: `records-${competence}-${employeeId}`,
    type: 'Registros para conferir',
    employeeName: item.name,
    description: `${item.count} ${item.count === 1 ? 'registro' : 'registros'} em ${competenceLabel.toLowerCase()}.`,
    dateLabel: competenceLabel,
    actionLabel: 'Abrir perfil',
    actionPath: `/employees/${employeeId}`,
  }));
}

export function useDashboardCompetence(competence: string): DashboardCompetenceView {
  const {
    currentCompetence,
    movements,
    closingSummaries,
    totalForecast,
  } = useAppData();
  const { employees } = useEmployees();
  const { isPro } = usePlan();

  return useMemo(() => {
    const usesStoredReview = competence === currentCompetence;
    const competenceMovements = movements.filter((movement) => movement.competence === competence);
    const summaries = usesStoredReview
      ? closingSummaries
      : computeActiveClosingSummaries(employees, movements, competence, {});
    const forecast = usesStoredReview
      ? totalForecast
      : summaries.reduce((sum, item) => sum + item.forecast, 0);
    const totals = sumMovementsByType(competenceMovements);
    const competenceLabel = competenceToLabel(competence);
    const pendingItems = pendingItemsForCompetence(
      competence,
      competenceLabel,
      summaries,
      competenceMovements,
      isPro,
      usesStoredReview,
    );

    return {
      competenceLabel,
      summaries,
      totalForecast: forecast,
      competenceMovements,
      overtimeHours: formatMinutesAsHours(totals.overtimeMinutes),
      overtimeEmployeeCount: countOvertimeEmployees(competenceMovements, competence),
      pendingItems,
      pendingTitle: isPro && usesStoredReview ? 'Pendências de revisão' : 'Pendências para conferir',
      pendingEmptyMessage:
        isPro && usesStoredReview
          ? 'Todos os fechamentos da competência atual já foram revisados.'
          : 'Não há pendências nesta competência.',
      pendingShortcut: 'Ver fechamentos',
      showPendingShortcut: isPro && usesStoredReview,
      pendingDetailsPath: '/closings?filter=pending',
    };
  }, [
    closingSummaries,
    competence,
    currentCompetence,
    employees,
    isPro,
    movements,
    totalForecast,
  ]);
}
