import json
import re

with open("extracted_units.json", "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace minified values with TypeScript equivalents
ts_content = js_content

# ce.Normal -> LessonType.Normal
# ce.Poem -> LessonType.Poem
ts_content = ts_content.replace('type:ce.Normal', 'type: LessonType.Normal')
ts_content = ts_content.replace('type:ce.Poem', 'type: LessonType.Poem')

# L.TrueFalse -> ExerciseType.TrueFalse
# L.MultipleChoice -> ExerciseType.MultipleChoice
# L.FillInTheBlank -> ExerciseType.FillInTheBlank
# L.Matching -> ExerciseType.Matching
ts_content = ts_content.replace('type:L.TrueFalse', 'type: ExerciseType.TrueFalse')
ts_content = ts_content.replace('type:L.MultipleChoice', 'type: ExerciseType.MultipleChoice')
ts_content = ts_content.replace('type:L.FillInTheBlank', 'type: ExerciseType.FillInTheBlank')
ts_content = ts_content.replace('type:L.Matching', 'type: ExerciseType.Matching')

# Booleans: !0 -> true, !1 -> false
ts_content = ts_content.replace(':!0', ': true')
ts_content = ts_content.replace(':!1', ': false')

# Let's read the rest of the original data.ts to keep the imports at the top and the export at the bottom.
# Let's see what imports are there:
imports = """import { Unit, LessonType, ExerciseType } from './types';

export const INITIAL_UNITS: Unit[] = """

# Let's write out the new data.ts
with open("src/data.ts", "w", encoding="utf-8") as out:
    out.write(imports)
    out.write(ts_content)
    out.write(";\n")

print("Successfully generated src/data.ts!")
