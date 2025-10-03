<?php

namespace App\Services;

use App\ActionItemStatus;
use App\ActionItemType;
use App\Models\ActionItem;
use App\Models\MonitoringNote;
use Illuminate\Database\Eloquent\Collection;

class ActionItemService
{
    public function createActionItem(int $monitoringNoteId, array $data): ActionItem
    {
        return ActionItem::create([
            'monitoring_note_id'        => $monitoringNoteId,
            'action_description'        => $data['action_description'],
            'item_type'                 => $data['item_type'] ?? ActionItemType::NEXT_PERIOD->value,
            'progress_notes'            => $data['progress_notes'] ?? '',
            'people_in_charge'          => $data['people_in_charge'] ?? '',
            'notes'                     => $data['notes'] ?? '',
            'due_date'                  => $data['due_date'] ?? null,
            'status'                    => $data['status'] ?? ActionItemStatus::PENDING->value,
            'previous_action_item_id'   => $data['previous_action_item_id'] ?? null,
        ]);
    }

    public function updateActionItem(int $actionItemId, array $data): ActionItem
    {
        $actionItem = ActionItem::findOrFail($actionItemId);

        $updateData = array_filter([
            'action_description' => $data['action_description'] ?? null,
            'progress_notes'     => $data['progress_notes'] ?? null,
            'people_in_charge'   => $data['people_in_charge'] ?? null,
            'notes'              => $data['notes'] ?? null,
            'due_date'           => $data['due_date'] ?? null,
            'completion_date'    => $data['completion_date'] ?? null,
            'status'             => $data['status'] ?? null,
        ], function ($value) {
            return $value !== null;
        });

        $actionItem->update($updateData);
        return $actionItem->fresh();
    }

    public function deleteActionItem(int $actionItemId): bool
    {
        $actionItem = ActionItem::findOrFail($actionItemId);
        return $actionItem->delete();
    }

    public function copyFromPreviousPeriod(int $monitoringNoteId, int $borrowerId): Collection
    {
        $previousNote = MonitoringNote::whereHas('watchlist', function ($query) use ($borrowerId) {
                            $query->where('borrower_id', $borrowerId);
                        })
                        ->where('id', '!=', $monitoringNoteId)
                        ->with('actionItems')
                        ->orderBy('created_at', 'desc')
                        ->first();

        if (!$previousNote) {
            return new Collection();
        }

        $copiedItems = new Collection();

        foreach ($previousNote->actionItems as $item) {
            $newItem = $this->createActionItem($monitoringNoteId, [
                'action_description'        => $item->action_description,
                'item_type'                 => ActionItemType::PREVIOUS_PERIOD->value,
                'progress_notes'            => '', // Reset progress_notes untuk diisi ulang
                'people_in_charge'          => $item->people_in_charge,
                'notes'                     => $item->notes ?? '',
                'due_date'                  => $item->due_date,
                'status'                    => ActionItemStatus::PENDING->value, // Reset status
                'previous_action_item_id'   => $item->id
            ]);

            $copiedItems->push($newItem);
        }

        return $copiedItems;
    }
}