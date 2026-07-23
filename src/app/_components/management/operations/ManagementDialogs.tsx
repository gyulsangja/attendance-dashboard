'use client';

import type { ManagementOperations } from './useManagementOperations';
import ScheduleEditDialog from './dialogs/ScheduleEditDialog';
import ScheduleEntryDialog from './dialogs/ScheduleEntryDialog';
import ShiftEditDialog from './dialogs/ShiftEditDialog';
import ShiftEntryDialog from './dialogs/ShiftEntryDialog';
import TimeEditDialog from './dialogs/TimeEditDialog';

type Props = Pick<ManagementOperations, 'actions' | 'dialogs' | 'state'>;

export default function ManagementDialogs({
  actions,
  dialogs,
  state,
}: Props) {
  const {
    schedules,
    shifts,
    week,
    weekShiftWorkers,
  } = state;

  return (
    <>
      <ScheduleEntryDialog
        key={`schedule-entry-${week.startDate}-${week.endDate}-${dialogs.scheduleOpen}`}
        open={dialogs.scheduleOpen}
        existing={schedules}
        onClose={() => dialogs.setScheduleOpen(false)}
        onSave={actions.addSchedules}
      />
      <ShiftEntryDialog
        key={`shift-entry-${week.startDate}-${week.endDate}-${dialogs.shiftOpen}`}
        open={dialogs.shiftOpen}
        existing={shifts}
        workers={weekShiftWorkers}
        period={{ startDate: week.startDate, endDate: week.endDate }}
        onClose={() => dialogs.setShiftOpen(false)}
        onSave={actions.addShifts}
      />
      <ShiftEditDialog
        key={dialogs.editingShift?.id ?? 'closed-shift-editor'}
        value={dialogs.editingShift}
        onClose={() => dialogs.setEditingShift(null)}
        onSave={async (shift) => {
          await actions.updatePendingShift(shift);
          dialogs.setEditingShift(null);
        }}
        onDelete={async (id) => {
          await actions.deletePendingShift(id);
          dialogs.setEditingShift(null);
        }}
      />
      <ScheduleEditDialog
        value={dialogs.editingSchedule}
        onChange={dialogs.setEditingSchedule}
        onSave={actions.saveEditedSchedule}
      />
      <TimeEditDialog
        value={dialogs.editingTime}
        onChange={dialogs.setEditingTime}
        onSave={actions.saveDeviceTime}
        onAddSchedule={dialogs.addTimeSchedule}
        onModifySchedule={dialogs.modifyTimeSchedule}
        onDeleteSchedule={dialogs.deleteTimeSchedule}
        saving={dialogs.isSavingDeviceTime}
        error={dialogs.hasDeviceTimeError}
      />
    </>
  );
}



