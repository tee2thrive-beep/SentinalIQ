import time
from scripts.process_normalization import process_normalization
from scripts.process_correlation import process_correlation
from scripts.process_clustering import process_clustering
from scripts.process_scoring import process_scoring
from scripts.process_priority import process_priority

t0 = time.time()
process_normalization()
process_correlation()
process_clustering()
process_scoring()
process_priority()
t1 = time.time()
print(f"Steps 1-6 completed in {t1-t0:.3f} seconds!")
