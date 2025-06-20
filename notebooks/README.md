# ProcurementPro - Kaggle Testing

This directory contains Jupyter notebooks and resources for testing the ProcurementPro API on Kaggle.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r ../requirements.txt
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your local or staging environment details

3. **Start Jupyter Notebook**
   ```bash
   jupyter notebook
   ```
   Then open `api_testing.ipynb`

## Notebooks

### `api_testing.ipynb`
A comprehensive notebook for testing the ProcurementPro API, including:
- Authentication tests
- Endpoint validation
- Performance testing
- Load testing

## Test Data

The `test_data/` directory contains sample datasets for testing various API endpoints.

## Running Tests

1. Open `api_testing.ipynb` in Jupyter
2. Run cells sequentially
3. Review the output and visualizations

## Customizing Tests

- Update the test user credentials in the first cell
- Modify the endpoint URLs if your API is hosted elsewhere
- Adjust the number of requests in load tests as needed

## Best Practices

1. Always test in a non-production environment first
2. Start with a small number of requests for load testing
3. Monitor your API's performance metrics during testing
4. Document any issues or observations
