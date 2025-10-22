<?php

namespace App\Http\Requests;

use App\Enums\ApprovalStatus;
use App\Enums\Classification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SubmitApprovalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(ApprovalStatus::class)],
            'notes' => 'nullable|string|max:1000',

            'final_classification' => ['nullable', new Enum(Classification::class)],
            'override_reason' => 'nullable|string|max:1000|required_with:final_classification',

            'business_notes' => 'nullable|string',
            'reviewer_notes' => 'nullable|string',
        ];
    }
}
