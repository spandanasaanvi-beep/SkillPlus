from abc import ABC, abstractmethod
from typing import Any, Dict, List


class LabourDataProvider(ABC):
    @abstractmethod
    def get_records(self) -> List[Dict[str, Any]]:
        """Return canonical labour-market records."""


class JobDemandProvider(LabourDataProvider):
    pass


class TrainingSupplyProvider(LabourDataProvider):
    pass


class EmploymentDataProvider(LabourDataProvider):
    pass
