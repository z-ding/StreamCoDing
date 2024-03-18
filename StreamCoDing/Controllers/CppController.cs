using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using StreamCoDing.Repositories;

namespace StreamCoDing.Controllers
{
    public class CppCodeInput
    {
        public string CppCode { get; set; }
        public string ProblemID { get; set; } // Add property for problemID
    }

    public class CppExecutionResult
    {
        public string StandardOutput { get; set; }
        public int ReturnValue { get; set; }
        public string CodeOutput { get; set; }
        public string expectedOutput { get; set; }
    }

    [ApiController]
    [Route("cppCompiler")]
    public class CppController : ControllerBase
    {
        private readonly ILogger<CppController> _logger;
        private readonly IItemsRepository repository;
        public CppController(ILogger<CppController> logger, IItemsRepository repository)
        {
            _logger = logger;
            this.repository = repository;//dependancy injection
        }
        private string ParseResVector(string output)
        {
            // Split the output into lines
            string[] lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            // Find the line that contains comma-separated integers
            foreach (string line in lines)
            {
                if (IsCommaSeparatedIntegers(line))
                {
                    // Extract the line containing the comma-separated integers
                    return line.Trim();
                }
            }

            // If a suitable line is not found, return an empty string
            return "";
        }
        // Method to check if a line contains comma-separated integers
        private bool IsCommaSeparatedIntegers(string line)
        {
            // Remove leading and trailing whitespace
            line = line.Trim();

            // Split the line by commas
            string[] parts = line.Split(',');

            // Check if each part can be parsed as an integer
            foreach (string part in parts)
            {
                // Attempt to parse each part as an integer
                if (!int.TryParse(part.Trim(), out _))
                {
                    // If parsing fails, the line doesn't contain comma-separated integers
                    return false;
                }
            }

            // If all parts are successfully parsed as integers, the line contains comma-separated integers
            return true;
        }

        [HttpPost]
        public async Task<IActionResult> CompileAndRunCpp([FromBody] CppCodeInput input)
        {
            string res = "";
            // Convert problemID from string to Guid
            if (!Guid.TryParse(input.ProblemID, out Guid problemGuid))
            {
                return BadRequest("Invalid problemID format.");
            }
            var problem = await repository.GetItemAsync(problemGuid);
            var isAccepted = problem.TestCases[0].ExpectedOutput == string.Join(",", res); // Assuming res is a vector<int> converted to a string
            try
            {             
                if (input == null || string.IsNullOrWhiteSpace(input.CppCode))
                {
                    return BadRequest("No valid C++ code provided.");
                }

                _logger.LogInformation("Received request with payload: {cppCode}", input.CppCode);

                string tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.cpp");
                await System.IO.File.WriteAllTextAsync(tempFile, input.CppCode);

                string executableFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.exe");

                using (Process process = new Process())
                {
                    process.StartInfo.FileName = "C:\\MinGW\\bin\\g++"; // Update this with the correct path to g++
                    process.StartInfo.Arguments = $"-o {executableFile} {tempFile}";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true; // Redirect standard error to capture compilation errors

                    process.Start();
                    string compilationErrorOutput = await process.StandardError.ReadToEndAsync(); // Read compilation errors
                    await process.WaitForExitAsync();

                    // Check if compilation was successful
                    if (!System.IO.File.Exists(executableFile) || !string.IsNullOrWhiteSpace(compilationErrorOutput))
                    {
                        return BadRequest($"Compilation failed. Error output: {compilationErrorOutput}");
                    }
                }

                // Execute compiled C++ code with a timeout
                using (var cts = new System.Threading.CancellationTokenSource())
                {
                    cts.CancelAfter(TimeSpan.FromSeconds(1)); // Set timeout to 1 second

                    var executionProcess = new Process();
                    executionProcess.StartInfo.FileName = executableFile;
                    executionProcess.StartInfo.UseShellExecute = false;
                    executionProcess.StartInfo.RedirectStandardOutput = true;

                    var timeoutTask = Task.Delay(TimeSpan.FromSeconds(1), cts.Token);
                    var executionTask = Task.Run(() =>
                    {
                        executionProcess.Start();
                        string output = executionProcess.StandardOutput.ReadToEnd();
                        res = ParseResVector(output);
                        executionProcess.WaitForExit();
                        int returnValue = executionProcess.ExitCode; // Capture return value

                        // Clean up temporary files
                        System.IO.File.Delete(tempFile);
                        System.IO.File.Delete(executableFile);
                        var executionResult = new CppExecutionResult
                        {
                            StandardOutput = output,
                            ReturnValue = returnValue,
                            CodeOutput = res,
                            expectedOutput = problem.TestCases[0].ExpectedOutput
                        };

                        return executionResult;
                    });

                    // Wait for either execution to complete or timeout
                    await Task.WhenAny(executionTask, timeoutTask);

                    if (!executionTask.IsCompleted)
                    {
                        // Timeout occurred
                        return BadRequest("Execution timed out.");
                    }


                    return Ok(await executionTask);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing request: {message}", ex.Message);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}