import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface BBATTRequirementsProps {
  visible?: boolean;
}

export function BBATTRequirements({ visible = true }: BBATTRequirementsProps) {
  if (!visible) return null;

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <CheckCircle2 className="h-5 w-5" />
          BBA Tourism & Travel - Evaluation & Grading Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Passing Requirements */}
          <div className="space-y-2">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Passing Requirements
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Each Subject:</span>
                <Badge variant="secondary">36% minimum</Badge>
              </div>
              <div className="flex justify-between">
                <span>Theory/Practical:</span>
                <Badge variant="secondary">40% minimum</Badge>
              </div>
              <div className="flex justify-between">
                <span>Aggregate:</span>
                <Badge variant="secondary">45% minimum</Badge>
              </div>
              <div className="flex justify-between">
                <span>SGPA/CGPA:</span>
                <Badge variant="secondary">4.0 minimum</Badge>
              </div>
            </div>
          </div>

          {/* Grace Marks */}
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Grace Marks
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Formula:</strong> 1% of theory aggregate OR 6 marks
                <br />
                <span className="text-xs text-gray-600">
                  (whichever is minimum)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Applicable to:</span>
                <Badge variant="outline">Theory only</Badge>
              </div>
              <div className="text-xs text-gray-600">
                Grace helps students reach 36% minimum in failed theory subjects
              </div>
            </div>
          </div>

          {/* Division Criteria */}
          <div className="space-y-2">
            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Division Criteria
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>First Division:</span>
                <Badge className="bg-green-100 text-green-800">60%+</Badge>
              </div>
              <div className="flex justify-between">
                <span>Second Division:</span>
                <Badge className="bg-yellow-100 text-yellow-800">45%+</Badge>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <Badge className="bg-red-100 text-red-800">&lt; 45%</Badge>
              </div>
              <div className="text-xs text-gray-600">
                Grace indicated with (G) suffix
              </div>
            </div>
          </div>
        </div>

        {/* Grading Scale */}
        <div className="mt-4 p-3 bg-white rounded-lg border">
          <h4 className="font-semibold mb-2 text-gray-800">Grading Scale</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold">O</div>
              <div>91-100</div>
              <div className="text-gray-600">GP: 10</div>
            </div>
            <div className="text-center">
              <div className="font-bold">A+</div>
              <div>81-90</div>
              <div className="text-gray-600">GP: 9</div>
            </div>
            <div className="text-center">
              <div className="font-bold">A</div>
              <div>71-80</div>
              <div className="text-gray-600">GP: 8</div>
            </div>
            <div className="text-center">
              <div className="font-bold">B+</div>
              <div>61-70</div>
              <div className="text-gray-600">GP: 7</div>
            </div>
            <div className="text-center">
              <div className="font-bold">B</div>
              <div>51-60</div>
              <div className="text-gray-600">GP: 6</div>
            </div>
            <div className="text-center">
              <div className="font-bold">C+</div>
              <div>41-50</div>
              <div className="text-gray-600">GP: 5</div>
            </div>
            <div className="text-center">
              <div className="font-bold">C</div>
              <div>36-40</div>
              <div className="text-gray-600">GP: 4</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">F</div>
              <div>&lt; 36</div>
              <div className="text-gray-600">GP: 0</div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h4 className="font-semibold text-amber-800 mb-1">
            Important Notes:
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>
              • Students must pass theory and practical examinations separately
            </li>
            <li>
              • Failed students can appear in subsequent corresponding semester
            </li>
            <li>• Minimum 4.0 SGPA/CGPA required for overall pass</li>
            <li>• Grace marks only apply to theory subjects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
