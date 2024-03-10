def remaining_for_x_percent(subjects_dict: dict, remaining_subjects: list, max_number: int) -> dict:
    subjects = subjects_dict.keys()
    total_subjects = len(subjects) + len(remaining_subjects)

    # Calculate the total maximum marks needed for 80% overall
    total_max_marks_80_percent = 0.8 * max_number * total_subjects

    # Calculate the marks needed per subject to achieve 80%
    marks_needed_per_subject = total_max_marks_80_percent / total_subjects

    # Calculate the total marks obtained in existing subjects
    total_marks_obtained = sum(subjects_dict.values())

    # Calculate the total marks obtained in existing subjects and remaining subjects
    total_marks_with_remaining = total_marks_obtained

    # Calculate how much more is needed to achieve 80% for the existing subjects
    marks_needed_existing_subjects = max(0, total_max_marks_80_percent - total_marks_obtained)

    # Calculate how much more is needed to achieve 80% for each remaining subject
    marks_needed_per_remaining_subject = marks_needed_existing_subjects / len(remaining_subjects)

    # Construct the dictionary to return
    returning = {}
    for subject in remaining_subjects:
        returning[subject] = marks_needed_per_remaining_subject

    return returning

# Example usage
print(remaining_for_x_percent({'english': 55, 'maths':  60, 'hindi': 54, 'sst': 56}, ['science'], 76))
